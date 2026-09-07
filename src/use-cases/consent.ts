import type { ConsentState, PrismaClient } from "@prisma/client";

import { isOptOutAllowed } from "@/domain/notifications";
import { err, ok, type Result } from "@/domain/index";

/** Consentimento LGPD append-only (ADR-0005, ticket 18). */

export type ConsentSubject = { subjectType: string; subjectId: string };

export async function recordConsent(
  db: PrismaClient,
  params: ConsentSubject & {
    type: string;
    textVersion: string;
    origin?: string | null;
  },
): Promise<{ id: string }> {
  const row = await db.consent.create({
    data: {
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      type: params.type,
      textVersion: params.textVersion,
      state: "GRANTED",
      origin: params.origin ?? null,
    },
  });
  return { id: row.id };
}

export async function revokeConsent(
  db: PrismaClient,
  params: ConsentSubject & { type: string; textVersion?: string },
): Promise<void> {
  await db.consent.create({
    data: {
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      type: params.type,
      textVersion: params.textVersion ?? "n/a",
      state: "REVOKED",
    },
  });
}

export async function hasActiveConsent(
  db: PrismaClient,
  params: ConsentSubject & { type: string },
): Promise<boolean> {
  const latest = await db.consent.findFirst({
    where: {
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      type: params.type,
    },
    orderBy: { createdAt: "desc" },
  });
  return latest?.state === ("GRANTED" satisfies ConsentState);
}

export function listConsents(db: PrismaClient, params: ConsentSubject) {
  return db.consent.findMany({
    where: { subjectType: params.subjectType, subjectId: params.subjectId },
    orderBy: { createdAt: "desc" },
  });
}

// --- Preferências de notificação (envolve NotificationOptOut do ticket 05) ---

export async function setNotificationOptOut(
  db: PrismaClient,
  params: { subjectId: string; category: string; optOut: boolean },
): Promise<Result<void, "transactional_category">> {
  if (!isOptOutAllowed(params.category)) return err("transactional_category");

  if (params.optOut) {
    await db.notificationOptOut.upsert({
      where: {
        subjectId_category: {
          subjectId: params.subjectId,
          category: params.category,
        },
      },
      create: { subjectId: params.subjectId, category: params.category },
      update: {},
    });
  } else {
    await db.notificationOptOut.deleteMany({
      where: { subjectId: params.subjectId, category: params.category },
    });
  }
  return ok(undefined);
}

export function listNotificationOptOuts(db: PrismaClient, subjectId: string) {
  return db.notificationOptOut.findMany({ where: { subjectId } });
}
