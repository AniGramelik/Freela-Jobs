import type { PrismaClient } from "@prisma/client";

import { err, ok, type Result } from "@/domain/index";

import type { AuditRecorder } from "./audit";

/** Moderação da rede local (ticket 25). */

export async function reportContent(
  db: PrismaClient,
  params: {
    reporterUserId?: string | null;
    targetType: "professional_profile" | "job_posting" | "user";
    targetId: string;
    reason: string;
  },
): Promise<Result<{ reportId: string }, "invalid">> {
  if (!params.reason.trim() || !params.targetId) return err("invalid");
  const report = await db.report.create({
    data: {
      reporterUserId: params.reporterUserId ?? null,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason.trim(),
    },
  });
  return ok({ reportId: report.id });
}

export async function blockUser(
  db: PrismaClient,
  audit: AuditRecorder,
  params: { supportUserId: string; userId: string; reason: string },
): Promise<Result<{ userId: string }, "not_found">> {
  const user = await db.user.findUnique({ where: { id: params.userId } });
  if (!user) return err("not_found");

  await db.$transaction([
    db.user.update({
      where: { id: params.userId },
      data: { blockedAt: new Date() },
    }),
    db.session.deleteMany({ where: { userId: params.userId } }),
  ]);
  await audit.record({
    actorUserId: params.supportUserId,
    actingAs: "support",
    action: "user.blocked",
    targetType: "User",
    targetId: params.userId,
    after: { reason: params.reason },
  });
  return ok({ userId: params.userId });
}

export async function removeFromPublicNetwork(
  db: PrismaClient,
  audit: AuditRecorder,
  params: { supportUserId: string; professionalProfileId: string; reason: string },
): Promise<void> {
  await db.publicListing.updateMany({
    where: { professionalProfileId: params.professionalProfileId },
    data: { active: false },
  });
  await audit.record({
    actorUserId: params.supportUserId,
    actingAs: "support",
    action: "public_listing.removed",
    targetType: "ProfessionalProfile",
    targetId: params.professionalProfileId,
    after: { reason: params.reason },
  });
}

export function listReports(
  db: PrismaClient,
  params: { state?: "OPEN" | "ACTIONED" | "DISMISSED" } = {},
) {
  return db.report.findMany({
    where: params.state ? { state: params.state } : {},
    orderBy: { createdAt: "asc" },
  });
}

export async function resolveReport(
  db: PrismaClient,
  params: { reportId: string; state: "ACTIONED" | "DISMISSED" },
): Promise<void> {
  await db.report.update({
    where: { id: params.reportId },
    data: { state: params.state },
  });
}
