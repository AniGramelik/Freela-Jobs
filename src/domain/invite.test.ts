import { describe, expect, it } from "vitest";

import { INVITE_TTL_MS, inviteExpiry, isInviteUsable } from "./invite";

const now = new Date("2026-09-06T12:00:00Z");

describe("invite", () => {
  it("expira 60 dias à frente", () => {
    expect(inviteExpiry(now).getTime()).toBe(now.getTime() + INVITE_TTL_MS);
    expect(INVITE_TTL_MS).toBe(60 * 24 * 60 * 60 * 1000);
  });

  it("usável só se PENDING e não expirado", () => {
    const future = new Date(now.getTime() + 1000);
    const past = new Date(now.getTime() - 1000);
    expect(isInviteUsable("PENDING", future, now)).toBe(true);
    expect(isInviteUsable("PENDING", past, now)).toBe(false);
    expect(isInviteUsable("ACCEPTED", future, now)).toBe(false);
    expect(isInviteUsable("REVOKED", future, now)).toBe(false);
  });
});
