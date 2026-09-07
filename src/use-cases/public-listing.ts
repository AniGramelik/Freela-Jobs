import type { PrismaClient } from "@prisma/client";

import { recordConsent, revokeConsent } from "./consent";

/** Opt-in de visibilidade na rede local (ADR-0007, ticket 22). */

const CONSENT_VERSION = "rede-local-v1";

export async function setPublicVisibility(
  db: PrismaClient,
  params: {
    professionalProfileId: string;
    roles: string[];
    radiusKm?: number;
    showPhone?: boolean;
    origin?: string | null;
  },
): Promise<{ active: true }> {
  const roles = [...new Set(params.roles.map((r) => r.trim().toLowerCase()).filter(Boolean))];

  await db.$transaction(async (tx) => {
    await tx.publicListing.upsert({
      where: { professionalProfileId: params.professionalProfileId },
      create: {
        professionalProfileId: params.professionalProfileId,
        active: true,
        roles,
        radiusKm: params.radiusKm && params.radiusKm > 0 ? params.radiusKm : 30,
        showPhone: params.showPhone ?? false,
      },
      update: {
        active: true,
        roles,
        radiusKm: params.radiusKm && params.radiusKm > 0 ? params.radiusKm : 30,
        showPhone: params.showPhone ?? false,
      },
    });
  });

  await recordConsent(db, {
    subjectType: "professional_profile",
    subjectId: params.professionalProfileId,
    type: "public_visibility",
    textVersion: CONSENT_VERSION,
    origin: params.origin ?? null,
  });
  return { active: true };
}

export async function revokePublicVisibility(
  db: PrismaClient,
  params: { professionalProfileId: string },
): Promise<void> {
  await db.publicListing.updateMany({
    where: { professionalProfileId: params.professionalProfileId },
    data: { active: false },
  });
  await revokeConsent(db, {
    subjectType: "professional_profile",
    subjectId: params.professionalProfileId,
    type: "public_visibility",
  });
}

export async function setPublicReputationOptIn(
  db: PrismaClient,
  params: { professionalProfileId: string; on: boolean; origin?: string | null },
): Promise<void> {
  await db.publicListing.updateMany({
    where: { professionalProfileId: params.professionalProfileId },
    data: { showReputation: params.on },
  });
  if (params.on) {
    await recordConsent(db, {
      subjectType: "professional_profile",
      subjectId: params.professionalProfileId,
      type: "public_reputation",
      textVersion: CONSENT_VERSION,
      origin: params.origin ?? null,
    });
  } else {
    await revokeConsent(db, {
      subjectType: "professional_profile",
      subjectId: params.professionalProfileId,
      type: "public_reputation",
    });
  }
}

export function getPublicListing(db: PrismaClient, professionalProfileId: string) {
  return db.publicListing.findUnique({ where: { professionalProfileId } });
}
