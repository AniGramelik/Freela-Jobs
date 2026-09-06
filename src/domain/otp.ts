/** Regras puras do OTP de telefone (ADR-0003, ticket 11). */

export const OTP_TTL_MS = 10 * 60 * 1_000; // 10 min
export const MAX_OTP_ATTEMPTS = 5;

export function otpExpiry(now: Date): Date {
  return new Date(now.getTime() + OTP_TTL_MS);
}

export function isOtpUsable(
  otp: { consumedAt: Date | null; expiresAt: Date; attempts: number },
  now: Date,
): boolean {
  return (
    otp.consumedAt === null &&
    otp.attempts < MAX_OTP_ATTEMPTS &&
    otp.expiresAt.getTime() > now.getTime()
  );
}
