import { describe, expect, it } from "vitest";

import { isWithinPilot } from "./pilot";

describe("isWithinPilot", () => {
  it("com gate ligado, só Colatina/ES passa (ignora acento e caixa)", () => {
    expect(isWithinPilot("Colatina", "ES", true)).toBe(true);
    expect(isWithinPilot("  colatína ", "es", true)).toBe(true);
    expect(isWithinPilot("Linhares", "ES", true)).toBe(false);
    expect(isWithinPilot("Colatina", "MG", true)).toBe(false);
  });

  it("com gate desligado, qualquer cidade passa", () => {
    expect(isWithinPilot("São Paulo", "SP", false)).toBe(true);
  });
});
