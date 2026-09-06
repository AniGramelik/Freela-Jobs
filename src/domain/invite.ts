/** Regras puras do convite (ADR-0003, ticket 10). */

export const INVITE_TTL_MS = 60 * 24 * 60 * 60 * 1_000; // 60 dias

export function inviteExpiry(now: Date): Date {
  return new Date(now.getTime() + INVITE_TTL_MS);
}

export function isInviteUsable(
  state: string,
  expiresAt: Date,
  now: Date,
): boolean {
  return state === "PENDING" && expiresAt.getTime() > now.getTime();
}
