import { describe, expect, it } from "vitest";

import {
  checkSendableBody,
  hasUnread,
  MAX_MESSAGE_LENGTH,
  normalizeMessageBody,
  otherSide,
  previewOf,
} from "./chat";

describe("corpo da mensagem", () => {
  it("normaliza pontas e quebras em excesso", () => {
    expect(normalizeMessageBody("  oi\r\n\n\n\ntudo bem?  ")).toBe(
      "oi\n\ntudo bem?",
    );
  });

  it("rejeita vazio e acima do limite; aceita o resto já normalizado", () => {
    expect(checkSendableBody("   ")).toEqual({ ok: false, reason: "empty" });
    expect(checkSendableBody("a".repeat(MAX_MESSAGE_LENGTH + 1))).toEqual({
      ok: false,
      reason: "too_long",
    });
    expect(checkSendableBody("  combinado  ")).toEqual({
      ok: true,
      body: "combinado",
    });
  });
});

describe("lados e leitura", () => {
  it("otherSide alterna", () => {
    expect(otherSide("COMPANY")).toBe("PROFESSIONAL");
    expect(otherSide("PROFESSIONAL")).toBe("COMPANY");
  });

  it("hasUnread: sem leitura é não-lido; senão compara timestamps", () => {
    const t2 = new Date("2026-09-07T12:00:02Z");
    const t1 = new Date("2026-09-07T12:00:01Z");
    expect(hasUnread(t2, null)).toBe(true);
    expect(hasUnread(t2, t1)).toBe(true);
    expect(hasUnread(t1, t2)).toBe(false);
    expect(hasUnread(t1, t1)).toBe(false);
  });
});

describe("preview", () => {
  it("achata espaços e trunca com reticências", () => {
    expect(previewOf("linha um\n  linha dois")).toBe("linha um linha dois");
    expect(previewOf("x".repeat(200)).endsWith("…")).toBe(true);
    expect(previewOf("x".repeat(200)).length).toBe(90);
  });
});
