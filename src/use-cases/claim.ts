import type { PrismaClient } from "@prisma/client";

import { normalizeEmail } from "@/domain/auth";
import { isOtpUsable, otpExpiry } from "@/domain/otp";
import { err, ok, type Result } from "@/domain/index";
import { logger } from "@/lib/logger";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";

import { PrismaAuditRecorder } from "./audit.prisma";
import { getUsableInvite } from "./invites";
import { mergeDuplicateProfiles } from "./merge";
import { consumeRateLimit } from "./rate-limit";

/**
 * Envio do OTP de claim. Sem provedor de SMS no piloto (D4): o `LogOtpSender`
 * registra o código; suporte/dev acompanha pelos logs.
 */
export interface OtpSender {
  send(phoneE164: string, code: string, purpose: string): Promise<void>;
}

export class LogOtpSender implements OtpSender {
  async send(phoneE164: string, code: string, purpose: string): Promise<void> {
    logger().info(
      { phoneE164, purpose, code },
      "otp_sent_via_log_sender",
    );
  }
}

export const defaultOtpSender: OtpSender = new LogOtpSender();

export async function requestClaimOtp(
  db: PrismaClient,
  sender: OtpSender,
  params: { token: string; now?: Date },
): Promise<Result<{ sent: true }, "invalid_invite" | "rate_limited">> {
  const now = params.now ?? new Date();
  const invite = await getUsableInvite(db, { token: params.token, now });
  if (!invite) return err("invalid_invite");

  const limit = await consumeRateLimit(db, {
    key: `claim-otp:${invite.professionalProfile.phoneE164}`,
    max: 3,
    windowMs: 10 * 60_000,
    now,
  });
  if (!limit.allowed) return err("rate_limited");

  const code = generateOtpCode();
  await db.phoneOtp.create({
    data: {
      phoneE164: invite.professionalProfile.phoneE164,
      codeHash: hashOtpCode(code),
      purpose: "claim",
      expiresAt: otpExpiry(now),
    },
  });
  await sender.send(invite.professionalProfile.phoneE164, code, "claim");
  return ok({ sent: true });
}

export type CompleteClaimError =
  | "invalid_invite"
  | "invalid_code"
  | "code_expired"
  | "profile_conflict";

class ClaimRaceError extends Error {}

export async function completeClaim(
  db: PrismaClient,
  params: { token: string; code: string; email: string; now?: Date },
): Promise<
  Result<{ userId: string; professionalProfileId: string }, CompleteClaimError>
> {
  const now = params.now ?? new Date();
  const invite = await getUsableInvite(db, { token: params.token, now });
  if (!invite) return err("invalid_invite");

  const phoneE164 = invite.professionalProfile.phoneE164;
  const otp = await db.phoneOtp.findFirst({
    where: { phoneE164, purpose: "claim", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || !isOtpUsable(otp, now)) return err("code_expired");

  if (hashOtpCode(params.code) !== otp.codeHash) {
    await db.phoneOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return err("invalid_code");
  }

  const email = normalizeEmail(params.email);
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    const owned = await db.professionalProfile.findFirst({
      where: { ownerUserId: existingUser.id },
      select: { id: true },
    });
    if (owned && owned.id !== invite.professionalProfileId) {
      return err("profile_conflict");
    }
  }

  let result: { userId: string };
  try {
    result = await db.$transaction(async (tx) => {
      // Guardas contra corrida: só um claim vence.
      const claimedInvite = await tx.invite.updateMany({
        where: { id: invite.id, state: "PENDING" },
        data: { state: "ACCEPTED", acceptedAt: now },
      });
      if (claimedInvite.count === 0) throw new ClaimRaceError();

      const consumedOtp = await tx.phoneOtp.updateMany({
        where: { id: otp.id, consumedAt: null },
        data: { consumedAt: now },
      });
      if (consumedOtp.count === 0) throw new ClaimRaceError();

      const user = existingUser
        ? existingUser
        : await tx.user.create({ data: { email, emailVerifiedAt: now } });

      await tx.professionalProfile.update({
        where: { id: invite.professionalProfileId },
        data: { state: "CLAIMED", ownerUserId: user.id },
      });

      return { userId: user.id };
    });
  } catch (error) {
    if (error instanceof ClaimRaceError) return err("invalid_invite");
    throw error;
  }

  await mergeDuplicateProfiles(db, new PrismaAuditRecorder(), {
    canonicalId: invite.professionalProfileId,
  });

  return ok({
    userId: result.userId,
    professionalProfileId: invite.professionalProfileId,
  });
}
