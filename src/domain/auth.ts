import { err, ok, type Result } from "./index";

/** Regras puras de autenticação (ADR-0002). Sem I/O. */

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(
  password: string,
): Result<void, "too_short" | "too_long"> {
  if (password.length < MIN_PASSWORD_LENGTH) return err("too_short");
  if (password.length > 200) return err("too_long");
  return ok(undefined);
}

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1_000; // 30 dias
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1_000; // 24 h
export const MAGIC_LINK_TTL_MS = 15 * 60 * 1_000; // 15 min

export function sessionExpiry(now: Date): Date {
  return new Date(now.getTime() + SESSION_TTL_MS);
}

/** Renova a sessão quando passou de metade da validade (sliding window). */
export function shouldRenewSession(expiresAt: Date, now: Date): boolean {
  const remaining = expiresAt.getTime() - now.getTime();
  return remaining < SESSION_TTL_MS / 2;
}

export function isExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() <= now.getTime();
}
