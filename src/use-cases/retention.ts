import type { PrismaClient } from "@prisma/client";

import { anonymizeProfile } from "./data-subject";

/**
 * Job de retenção (ADR-0005, ticket 20). Prazos ⚠️ pendentes de confirmação
 * jurídica (D1); implementados como constantes ajustáveis.
 */
export const RETENTION = {
  inviteStaleDays: 60,
  managedProfileIdleDays: 180,
  phoneOtpDays: 7,
  authTokenDays: 30,
};

export type RetentionReport = {
  dryRun: boolean;
  invitesExpired: number;
  profilesAnonymized: number;
  phoneOtpsDeleted: number;
  authTokensDeleted: number;
};

export async function runRetention(
  db: PrismaClient,
  opts: { now?: Date; dryRun?: boolean } = {},
): Promise<RetentionReport> {
  const now = opts.now ?? new Date();
  const dryRun = opts.dryRun ?? true;
  const cutoff = (days: number) => new Date(now.getTime() - days * 86_400_000);

  // 1. Convites vencidos ainda como PENDING.
  const staleInvites = await db.invite.findMany({
    where: { state: "PENDING", expiresAt: { lt: now } },
    select: { id: true },
  });
  if (!dryRun && staleInvites.length > 0) {
    await db.invite.updateMany({
      where: { id: { in: staleInvites.map((i) => i.id) } },
      data: { state: "EXPIRED" },
    });
  }

  // 2. Perfis MANAGED/INVITED parados há muito tempo, sem dono e sem atividade.
  const idleProfiles = await db.professionalProfile.findMany({
    where: {
      state: { in: ["MANAGED", "INVITED"] },
      ownerUserId: null,
      createdAt: { lt: cutoff(RETENTION.managedProfileIdleDays) },
      callOutResponses: { none: {} },
    },
    select: { id: true },
  });
  if (!dryRun) {
    for (const p of idleProfiles) {
      await anonymizeProfile(db, { professionalProfileId: p.id, now });
    }
  }

  // 3. OTPs e tokens de auth antigos.
  const otpWhere = {
    OR: [
      { consumedAt: { not: null } },
      { expiresAt: { lt: cutoff(RETENTION.phoneOtpDays) } },
    ],
    createdAt: { lt: cutoff(RETENTION.phoneOtpDays) },
  };
  const phoneOtps = await db.phoneOtp.count({ where: otpWhere });
  if (!dryRun) await db.phoneOtp.deleteMany({ where: otpWhere });

  const tokenCutoff = cutoff(RETENTION.authTokenDays);
  const mlWhere = { createdAt: { lt: tokenCutoff } };
  const evWhere = { createdAt: { lt: tokenCutoff } };
  const authTokens =
    (await db.magicLinkToken.count({ where: mlWhere })) +
    (await db.emailVerificationToken.count({ where: evWhere }));
  if (!dryRun) {
    await db.magicLinkToken.deleteMany({ where: mlWhere });
    await db.emailVerificationToken.deleteMany({ where: evWhere });
  }

  return {
    dryRun,
    invitesExpired: staleInvites.length,
    profilesAnonymized: idleProfiles.length,
    phoneOtpsDeleted: phoneOtps,
    authTokensDeleted: authTokens,
  };
}
