import type { PrismaClient } from "@prisma/client";

import { err, ok, type Result } from "@/domain/index";

/** Presença + avaliação interna + histórico (ADR-0003, ticket 17). */

export async function recordAttendance(
  db: PrismaClient,
  params: {
    companyId: string;
    callOutId: string;
    professionalProfileId: string;
    outcome: "COMPLETED" | "NO_SHOW";
  },
): Promise<Result<{ state: string }, "not_found" | "not_accepted">> {
  const callout = await db.callOut.findUnique({
    where: { id: params.callOutId },
  });
  if (!callout || callout.companyId !== params.companyId) return err("not_found");

  const response = await db.callOutResponse.findUnique({
    where: {
      callOutId_professionalProfileId: {
        callOutId: params.callOutId,
        professionalProfileId: params.professionalProfileId,
      },
    },
  });
  if (!response) return err("not_found");
  if (response.state !== "ACCEPTED") return err("not_accepted");

  await db.callOutResponse.update({
    where: { id: response.id },
    data: { state: params.outcome },
  });
  return ok({ state: params.outcome });
}

export async function submitInternalRating(
  db: PrismaClient,
  params: {
    companyId: string;
    professionalProfileId: string;
    score: number;
    comment?: string | null;
    callOutId?: string | null;
  },
): Promise<Result<{ ratingId: string }, "no_relationship" | "invalid_score">> {
  if (!Number.isInteger(params.score) || params.score < 1 || params.score > 5) {
    return err("invalid_score");
  }
  const rel = await db.workRelationship.findUnique({
    where: {
      companyId_professionalProfileId: {
        companyId: params.companyId,
        professionalProfileId: params.professionalProfileId,
      },
    },
  });
  if (!rel) return err("no_relationship");

  const rating = await db.internalRating.create({
    data: {
      companyId: params.companyId,
      professionalProfileId: params.professionalProfileId,
      callOutId: params.callOutId ?? null,
      score: params.score,
      comment: params.comment?.trim() || null,
    },
  });
  return ok({ ratingId: rating.id });
}

/** Histórico que a EMPRESA vê de um profissional (inclui as próprias avaliações). */
export async function getProfessionalHistoryForCompany(
  db: PrismaClient,
  params: { companyId: string; professionalProfileId: string },
) {
  const [responses, ratings] = await Promise.all([
    db.callOutResponse.findMany({
      where: {
        professionalProfileId: params.professionalProfileId,
        callOut: { companyId: params.companyId },
      },
      include: { callOut: { select: { role: true, shiftDate: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.internalRating.findMany({
      where: {
        companyId: params.companyId,
        professionalProfileId: params.professionalProfileId,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { responses, ratings };
}

/** Histórico que o PROFISSIONAL vê — nunca inclui avaliações internas. */
export async function getMyWorkHistory(
  db: PrismaClient,
  params: { professionalProfileId: string },
) {
  return db.callOutResponse.findMany({
    where: {
      professionalProfileId: params.professionalProfileId,
      state: { in: ["ACCEPTED", "COMPLETED", "NO_SHOW", "WITHDRAWN"] },
    },
    include: {
      callOut: {
        select: {
          role: true,
          shiftDate: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
