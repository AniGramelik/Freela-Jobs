import { describe, expect, it } from "vitest";

import { haversineKm, isWithinRadius } from "./geo";

const colatina = { latitude: -19.5386, longitude: -40.6306 };
const linhares = { latitude: -19.3946, longitude: -40.0644 }; // ~60 km

describe("haversineKm", () => {
  it("é ~0 para o mesmo ponto", () => {
    expect(haversineKm(colatina, colatina)).toBeCloseTo(0, 5);
  });

  it("estima a distância Colatina–Linhares em ~60 km", () => {
    expect(haversineKm(colatina, linhares)).toBeGreaterThan(55);
    expect(haversineKm(colatina, linhares)).toBeLessThan(70);
  });
});

describe("isWithinRadius", () => {
  it("dentro e fora do raio", () => {
    expect(isWithinRadius(colatina, linhares, 100)).toBe(true);
    expect(isWithinRadius(colatina, linhares, 20)).toBe(false);
  });
});
