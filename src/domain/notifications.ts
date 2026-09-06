/**
 * Regras puras de notificação (ADR-0004). Sem I/O.
 */

/** Categorias transacionais: nunca podem ter opt-out. */
export const TRANSACTIONAL_CATEGORIES = [
  "auth",
  "invite",
  "callout",
  "application_received",
  "application_status",
] as const;

const transactional = new Set<string>(TRANSACTIONAL_CATEGORIES);

export function isOptOutAllowed(category: string): boolean {
  return !transactional.has(category);
}

export function canSend(
  category: string,
  optedOutCategories: readonly string[],
): boolean {
  if (!isOptOutAllowed(category)) return true;
  return !optedOutCategories.includes(category);
}

export const MAX_OUTBOX_ATTEMPTS = 5;

/** Backoff exponencial determinístico, com teto. */
export function retryDelayMs(
  attempts: number,
  opts: { baseMs?: number; capMs?: number } = {},
): number {
  const base = opts.baseMs ?? 5_000;
  const cap = opts.capMs ?? 60 * 60 * 1_000;
  const exponent = Math.max(0, attempts - 1);
  return Math.min(cap, base * 2 ** exponent);
}

/** Estado do outbox após uma falha, já contando o incremento de `attempts`. */
export function outboxStateAfterFailure(attempts: number): "PENDING" | "DEAD" {
  return attempts >= MAX_OUTBOX_ATTEMPTS ? "DEAD" : "PENDING";
}
