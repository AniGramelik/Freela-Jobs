/**
 * Regras puras da mensageria (ADR-0009). Sem I/O.
 */

export type ChatSenderSide = "COMPANY" | "PROFESSIONAL";

export const MAX_MESSAGE_LENGTH = 2_000;

/** Tira espaços das pontas e colapsa quebras de linha em excesso. */
export function normalizeMessageBody(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type SendableCheck =
  | { ok: true; body: string }
  | { ok: false; reason: "empty" | "too_long" };

export function checkSendableBody(raw: string): SendableCheck {
  const body = normalizeMessageBody(raw);
  if (body.length === 0) return { ok: false, reason: "empty" };
  if (body.length > MAX_MESSAGE_LENGTH) return { ok: false, reason: "too_long" };
  return { ok: true, body };
}

export function otherSide(side: ChatSenderSide): ChatSenderSide {
  return side === "COMPANY" ? "PROFESSIONAL" : "COMPANY";
}

/** Há mensagem nova para este lado desde a última leitura dele? */
export function hasUnread(
  lastMessageAt: Date,
  lastReadAt: Date | null | undefined,
): boolean {
  if (!lastReadAt) return true;
  return lastMessageAt.getTime() > lastReadAt.getTime();
}

/** Trecho de pré-visualização da última mensagem na lista de conversas. */
export function previewOf(body: string, max = 90): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}
