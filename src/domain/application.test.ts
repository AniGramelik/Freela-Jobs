import { describe, expect, it } from "vitest";

import { canRespondToOffer, canScreen, canWithdraw } from "./application";

describe("triagem de candidatura", () => {
  it("segue o funil e permite rejeitar de qualquer etapa antes de aceita", () => {
    expect(canScreen("SUBMITTED", "UNDER_REVIEW")).toBe(true);
    expect(canScreen("UNDER_REVIEW", "SHORTLISTED")).toBe(true);
    expect(canScreen("SHORTLISTED", "OFFERED")).toBe(true);
    expect(canScreen("SUBMITTED", "SHORTLISTED")).toBe(false);
    expect(canScreen("SHORTLISTED", "REJECTED")).toBe(true);
    expect(canScreen("ACCEPTED", "REJECTED")).toBe(false);
  });

  it("retirada e resposta a oferta", () => {
    expect(canWithdraw("OFFERED")).toBe(true);
    expect(canWithdraw("ACCEPTED")).toBe(false);
    expect(canRespondToOffer("OFFERED")).toBe(true);
    expect(canRespondToOffer("SHORTLISTED")).toBe(false);
  });
});
