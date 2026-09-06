import { describe, expect, it } from "vitest";

import { isOtpUsable, MAX_OTP_ATTEMPTS, otpExpiry, OTP_TTL_MS } from "./otp";

const now = new Date("2026-09-06T12:00:00Z");
const fresh = { consumedAt: null, expiresAt: otpExpiry(now), attempts: 0 };

describe("otp", () => {
  it("TTL de 10 minutos", () => {
    expect(OTP_TTL_MS).toBe(10 * 60 * 1000);
  });

  it("usável quando não consumido, dentro do prazo e sob o limite de tentativas", () => {
    expect(isOtpUsable(fresh, now)).toBe(true);
    expect(isOtpUsable({ ...fresh, consumedAt: now }, now)).toBe(false);
    expect(isOtpUsable({ ...fresh, attempts: MAX_OTP_ATTEMPTS }, now)).toBe(false);
    expect(
      isOtpUsable({ ...fresh, expiresAt: new Date(now.getTime() - 1) }, now),
    ).toBe(false);
  });
});
