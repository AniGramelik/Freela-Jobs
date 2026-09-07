/** Máquina de estados da candidatura (ADR-0007, tickets 30–32). */

export type ApplicationState =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

const SCREEN_TARGETS: Record<string, ApplicationState[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["OFFERED", "REJECTED"],
  OFFERED: ["REJECTED"],
};

/** Transições que a EMPRESA pode fazer na triagem. */
export function canScreen(
  from: ApplicationState,
  to: ApplicationState,
): boolean {
  return (SCREEN_TARGETS[from] ?? []).includes(to);
}

/** O PROFISSIONAL pode retirar enquanto não virou oferta aceita/recusada. */
export function canWithdraw(state: ApplicationState): boolean {
  return (
    state === "SUBMITTED" ||
    state === "UNDER_REVIEW" ||
    state === "SHORTLISTED" ||
    state === "OFFERED"
  );
}

export function canRespondToOffer(state: ApplicationState): boolean {
  return state === "OFFERED";
}
