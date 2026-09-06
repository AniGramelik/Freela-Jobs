import { describe, expect, it } from "vitest";

import { isValidE164, toE164 } from "./phone";

describe("toE164 (BR)", () => {
  it("normaliza celular local com máscara", () => {
    expect(toE164("(27) 99912-3456")).toEqual({
      ok: true,
      value: "+5527999123456",
    });
  });

  it("normaliza fixo local de 10 dígitos", () => {
    expect(toE164("2733221100")).toEqual({ ok: true, value: "+552733221100" });
  });

  it("aceita número já com 55", () => {
    expect(toE164("55 27 99912-3456")).toEqual({
      ok: true,
      value: "+5527999123456",
    });
  });

  it("aceita E.164 já formatado", () => {
    expect(toE164("+5527999123456")).toEqual({
      ok: true,
      value: "+5527999123456",
    });
  });

  it("rejeita curto demais e lixo", () => {
    expect(toE164("123")).toEqual({ ok: false, error: "invalid" });
    expect(toE164("abc")).toEqual({ ok: false, error: "invalid" });
    expect(toE164("+55")).toEqual({ ok: false, error: "invalid" });
  });
});

describe("isValidE164", () => {
  it("valida o formato", () => {
    expect(isValidE164("+5527999123456")).toBe(true);
    expect(isValidE164("27999123456")).toBe(false);
    expect(isValidE164("+0" + "1".repeat(10))).toBe(false);
  });
});
