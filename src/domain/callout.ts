import { err, ok, type Result } from "./index";

/** Regras puras da convocação (ADR-0003, tickets 15/16). */

export type CallOutStatus =
  | "DRAFT"
  | "OPEN"
  | "FILLED"
  | "CLOSED"
  | "CANCELLED";

export type CallOutResponseState =
  | "OFFERED"
  | "ACCEPTED"
  | "DECLINED"
  | "WITHDRAWN"
  | "NO_SHOW"
  | "COMPLETED";

export function canPublishCallOut(
  callout: { status: CallOutStatus; quantity: number; shiftDate: Date },
  now: Date,
): Result<void, "not_draft" | "no_quantity" | "shift_past"> {
  if (callout.status !== "DRAFT") return err("not_draft");
  if (callout.quantity < 1) return err("no_quantity");
  if (callout.shiftDate.getTime() <= now.getTime()) return err("shift_past");
  return ok(undefined);
}

export function callOutStatusAfterAccept(
  acceptedCount: number,
  quantity: number,
): CallOutStatus {
  return acceptedCount >= quantity ? "FILLED" : "OPEN";
}

/** Transições permitidas para a resposta do profissional. */
export function canRespond(
  current: CallOutResponseState,
  action: "accept" | "decline" | "withdraw",
): boolean {
  if (action === "accept") return current === "OFFERED" || current === "DECLINED";
  if (action === "decline") return current === "OFFERED";
  if (action === "withdraw") return current === "ACCEPTED";
  return false;
}

export function acceptsResponses(status: CallOutStatus): boolean {
  return status === "OPEN";
}
