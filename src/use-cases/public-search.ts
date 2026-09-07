import type { PrismaClient } from "@prisma/client";

import { haversineKm } from "@/domain/geo";
import { err, ok, type Result } from "@/domain/index";

/** Busca e convite na rede local (ADR-0007, ticket 23). */

export type PublicResult = {
  professionalProfileId: string;
  fullName: string;
  roles: string[];
  approxLocation: string; // bairro/cidade, nunca o ponto exato
  phone: string | null;
  reputation: { average: number; count: number } | null;
  distanceKm: number | null;
};

export async function searchPublicNetwork(
  db: PrismaClient,
  params: { companyId: string; role: string; maxRadiusKm?: number },
): Promise<PublicResult[]> {
  const role = params.role.trim().toLowerCase();
  const address = await db.companyAddress.findUnique({
    where: { companyId: params.companyId },
  });
  const center =
    address?.latitude != null && address.longitude != null
      ? { latitude: address.latitude, longitude: address.longitude }
      : null;

  const listings = await db.publicListing.findMany({
    where: { active: true, roles: { has: role } },
    include: {
      professionalProfile: {
        select: {
          id: true,
          fullName: true,
          phoneE164: true,
          baseCity: true,
          baseState: true,
          latitude: true,
          longitude: true,
          state: true,
          relationships: {
            where: { companyId: params.companyId },
            select: { id: true },
          },
        },
      },
    },
  });

  const results: PublicResult[] = [];
  for (const listing of listings) {
    const p = listing.professionalProfile;
    if (p.state !== "CLAIMED") continue;
    if (p.relationships.length > 0) continue; // já tem vínculo com esta empresa

    let distanceKm: number | null = null;
    if (center && p.latitude != null && p.longitude != null) {
      distanceKm = haversineKm(center, {
        latitude: p.latitude,
        longitude: p.longitude,
      });
      const limit = Math.min(
        listing.radiusKm,
        params.maxRadiusKm ?? listing.radiusKm,
      );
      if (distanceKm > limit) continue;
    }

    results.push({
      professionalProfileId: p.id,
      fullName: p.fullName,
      roles: listing.roles,
      approxLocation: [p.baseCity, p.baseState].filter(Boolean).join("/") || "—",
      phone: listing.showPhone ? p.phoneE164 : null,
      reputation: listing.showReputation
        ? await aggregateReputation(db, p.id)
        : null,
      distanceKm: distanceKm == null ? null : Math.round(distanceKm),
    });
  }

  results.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  return results;
}

/** Reputação agregada e anônima — nunca comentários nem empresa avaliadora. */
export async function aggregateReputation(
  db: PrismaClient,
  professionalProfileId: string,
): Promise<{ average: number; count: number } | null> {
  const agg = await db.internalRating.aggregate({
    where: { professionalProfileId },
    _avg: { score: true },
    _count: true,
  });
  if (!agg._count || agg._avg.score == null) return null;
  return {
    average: Math.round(agg._avg.score * 10) / 10,
    count: agg._count,
  };
}

export async function invitePublicProfessional(
  db: PrismaClient,
  params: { companyId: string; professionalProfileId: string },
): Promise<Result<{ relationshipId: string }, "not_public" | "already_linked">> {
  const listing = await db.publicListing.findUnique({
    where: { professionalProfileId: params.professionalProfileId },
  });
  if (!listing || !listing.active) return err("not_public");

  const existing = await db.workRelationship.findUnique({
    where: {
      companyId_professionalProfileId: {
        companyId: params.companyId,
        professionalProfileId: params.professionalProfileId,
      },
    },
  });
  if (existing) return err("already_linked");

  const rel = await db.workRelationship.create({
    data: {
      companyId: params.companyId,
      professionalProfileId: params.professionalProfileId,
      state: "PENDING_CONSENT",
    },
  });
  return ok({ relationshipId: rel.id });
}
