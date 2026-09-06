import { describe, expect, it } from "vitest";

import {
  isExpired,
  isValidEmail,
  normalizeEmail,
  SESSION_TTL_MS,
  sessionExpiry,
  shouldRenewSession,
  validatePassword,
} from "./auth";

describe("normalizeEmail", () => {
  it("faz trim e minúsculo", () => {
    expect(normalizeEmail("  Ana@Exemplo.COM ")).toBe("ana@exemplo.com");
  });
});

describe("isValidEmail", () => {
  it("aceita e-mail simples e rejeita lixo", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("sem-arroba")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("exige comprimento mínimo", () => {
    expect(validatePassword("1234567")).toEqual({ ok: false, error: "too_short" });
    expect(validatePassword("12345678")).toEqual({ ok: true, value: undefined });
  });

  it("rejeita senha absurdamente longa", () => {
    expect(validatePassword("x".repeat(201))).toEqual({
      ok: false,
      error: "too_long",
    });
  });
});

describe("sessão", () => {
  const now = new Date("2026-09-06T12:00:00Z");

  it("expira TTL à frente", () => {
    expect(sessionExpiry(now).getTime()).toBe(now.getTime() + SESSION_TTL_MS);
  });

  it("renova só depois de passar da metade da validade", () => {
    const fresh = new Date(now.getTime() + SESSION_TTL_MS);
    const old = new Date(now.getTime() + SESSION_TTL_MS / 2 - 1);
    expect(shouldRenewSession(fresh, now)).toBe(false);
    expect(shouldRenewSession(old, now)).toBe(true);
  });

  it("isExpired compara com now", () => {
    expect(isExpired(new Date(now.getTime() - 1), now)).toBe(true);
    expect(isExpired(new Date(now.getTime() + 1), now)).toBe(false);
  });
});
