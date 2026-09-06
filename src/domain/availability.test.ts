import { describe, expect, it } from "vitest";

import {
  AVAILABLE_NOW_TTL_MS,
  availableNowExpiry,
  isAvailableNow,
  isValidShift,
  isValidWeekday,
} from "./availability";

const now = new Date("2026-09-06T12:00:00Z");

describe("availability", () => {
  it("TTL de 8 horas para 'disponível agora'", () => {
    expect(availableNowExpiry(now).getTime()).toBe(
      now.getTime() + AVAILABLE_NOW_TTL_MS,
    );
  });

  it("isAvailableNow considera a expiração", () => {
    expect(isAvailableNow(new Date(now.getTime() + 1), now)).toBe(true);
    expect(isAvailableNow(new Date(now.getTime() - 1), now)).toBe(false);
    expect(isAvailableNow(null, now)).toBe(false);
  });

  it("valida weekday e shift", () => {
    expect(isValidWeekday(0)).toBe(true);
    expect(isValidWeekday(6)).toBe(true);
    expect(isValidWeekday(7)).toBe(false);
    expect(isValidShift("NIGHT")).toBe(true);
    expect(isValidShift("DAWN")).toBe(false);
  });
});
