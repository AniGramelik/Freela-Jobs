import type { PrismaClient } from "@prisma/client";

import { err, ok, type Result } from "@/domain/index";
import { hashToken } from "@/lib/tokens";

/** Direitos do titular (ADR-0005, ticket 19). */

const DELETION_SLA_DAYS = 15;

export async function exportMyData(
  db: PrismaClient,
  params: { userId: string },
): Promise<Record<string, unknown> | null> {
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { id: true, email: true, createdAt: true, emailVerifiedAt: true },
  });
  if (!user) return null;

  const profile = await db.professionalProfile.findFirst({
    where: { ownerUserId: params.userId },
    include: {
      availabilityWindows: { select: { weekday: true, shift: true } },
      relationships: {
        select: {
          state: true,
          roles: true,
          createdAt: true,
          company: { select: { name: true } },
        },
      },
      callOutResponses: {
        select: {
          state: true,
          createdAt: true,
          callOut: { select: { role: true, shiftDate: true } },
        },
      },
    },
  });

  const consents = profile
    ? await db.consent.findMany({
        where: { subjectType: "professional_profile", subjectId: profile.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const conversations = profile
    ? await db.conversation.findMany({
        where: { professionalProfileId: profile.id },
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          phoneRevealedAt: true,
          jobPostingId: true,
          callOutId: true,
          company: { select: { name: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            select: { senderSide: true, body: true, createdAt: true },
          },
        },
      })
    : [];

  return {
    exportedAt: new Date().toISOString(),
    user,
    professionalProfile: profile
      ? {
          fullName: profile.fullName,
          phone: profile.phoneE164,
          email: profile.email,
          state: profile.state,
          availability: profile.availabilityWindows,
          relationships: profile.relationships, // sem privateNote (não incluído)
          workHistory: profile.callOutResponses,
        }
      : null,
    conversations,
    consents,
  };
}

export async function requestDataDeletion(
  db: PrismaClient,
  params: { userId: string; reason?: string | null; now?: Date },
): Promise<{ requestId: string; dueAt: Date }> {
  const now = params.now ?? new Date();
  const dueAt = new Date(now.getTime() + DELETION_SLA_DAYS * 86_400_000);
  const request = await db.dataSubjectRequest.create({
    data: {
      userId: params.userId,
      type: "DELETION",
      reason: params.reason ?? null,
      dueAt,
    },
  });
  return { requestId: request.id, dueAt };
}

/**
 * Anonimiza o perfil: remove dados pessoais e mantém o histórico de trabalho
 * pseudonimizado (a empresa continua com a necessidade legítima do registro).
 */
export async function anonymizeProfile(
  db: PrismaClient,
  params: { professionalProfileId: string; now?: Date },
): Promise<Result<{ professionalProfileId: string }, "not_found">> {
  const profile = await db.professionalProfile.findUnique({
    where: { id: params.professionalProfileId },
  });
  if (!profile) return err("not_found");

  await db.$transaction([
    db.professionalProfile.update({
      where: { id: profile.id },
      data: {
        state: "ANONYMIZED",
        fullName: "Profissional removido",
        phoneE164: `anon:${hashToken(profile.id).slice(0, 16)}`,
        email: null,
        sourceNote: null,
        baseCity: null,
        baseState: null,
        latitude: null,
        longitude: null,
        availableNowUntil: null,
      },
    }),
    db.availabilityWindow.deleteMany({
      where: { professionalProfileId: profile.id },
    }),
    db.publicListing.deleteMany({
      where: { professionalProfileId: profile.id },
    }),
    db.application.updateMany({
      where: { professionalProfileId: profile.id },
      data: { resumeUrl: null, coverMessage: null },
    }),
    // Mensagens do titular viram texto neutro; as da empresa ficam (registro
    // da controladora). O telefone deixa de estar liberado em qualquer conversa.
    db.chatMessage.updateMany({
      where: {
        conversation: { professionalProfileId: profile.id },
        senderSide: "PROFESSIONAL",
      },
      data: { body: "[removido]" },
    }),
    db.conversation.updateMany({
      where: { professionalProfileId: profile.id },
      data: { phoneRevealedAt: null },
    }),
  ]);
  return ok({ professionalProfileId: profile.id });
}

export function listDataSubjectRequests(
  db: PrismaClient,
  params: { state?: "PENDING" | "IN_PROGRESS" | "DONE" | "REJECTED" } = {},
) {
  return db.dataSubjectRequest.findMany({
    where: params.state ? { state: params.state } : {},
    orderBy: { createdAt: "asc" },
  });
}
