import { describe, expect, it } from "vitest";

import {
  canSend,
  isOptOutAllowed,
  outboxStateAfterFailure,
  retryDelayMs,
} from "./notifications";

describe("opt-out por categoria", () => {
  it("categoria transacional não permite opt-out", () => {
    expect(isOptOutAllowed("callout")).toBe(false);
    expect(isOptOutAllowed("auth")).toBe(false);
  });

  it("categoria não transacional permite opt-out", () => {
    expect(isOptOutAllowed("digest")).toBe(true);
    expect(isOptOutAllowed("marketing")).toBe(true);
  });

  it("canSend ignora opt-out para transacional", () => {
    expect(canSend("callout", ["callout", "digest"])).toBe(true);
  });

  it("canSend respeita opt-out para não transacional", () => {
    expect(canSend("digest", ["digest"])).toBe(false);
    expect(canSend("digest", ["marketing"])).toBe(true);
  });
});

describe("retryDelayMs", () => {
  it("cresce exponencialmente a partir da base", () => {
    expect(retryDelayMs(1, { baseMs: 1000 })).toBe(1000);
    expect(retryDelayMs(2, { baseMs: 1000 })).toBe(2000);
    expect(retryDelayMs(3, { baseMs: 1000 })).toBe(4000);
  });

  it("respeita o teto", () => {
    expect(retryDelayMs(20, { baseMs: 1000, capMs: 10_000 })).toBe(10_000);
  });

  it("trata attempts <= 0 como a primeira tentativa", () => {
    expect(retryDelayMs(0, { baseMs: 1000 })).toBe(1000);
  });
});

describe("outboxStateAfterFailure", () => {
  it("vai a DEAD ao atingir o máximo de tentativas", () => {
    expect(outboxStateAfterFailure(4)).toBe("PENDING");
    expect(outboxStateAfterFailure(5)).toBe("DEAD");
  });
});
