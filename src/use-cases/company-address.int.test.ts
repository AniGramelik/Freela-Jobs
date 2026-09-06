import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { getCompanyAddress, setCompanyAddress } from "./company-address";
import { StubGeocoder } from "./geocoding";

const db: PrismaClient = getTestDb();
const geocoder = new StubGeocoder();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const company = () => db.company.create({ data: { name: "Bar" } });

describe("setCompanyAddress", () => {
  it("aceita endereço em Colatina/ES e geocodifica", async () => {
    const co = await company();
    const result = await setCompanyAddress(db, geocoder, {
      companyId: co.id,
      line: "Rua São Silvano, 100",
      city: "Colatina",
      state: "es",
      radiusKm: 15,
      pilotGateEnabled: true,
    });

    expect(result).toEqual({ ok: true, value: { geocoded: true } });
    const addr = await getCompanyAddress(db, co.id);
    expect(addr?.state).toBe("ES");
    expect(addr?.radiusKm).toBe(15);
    expect(addr?.geocodeStatus).toBe("OK");
    expect(addr?.latitude).toBeCloseTo(-19.5386, 3);
  });

  it("bloqueia cidade fora do piloto com gate ligado, e aceita com gate desligado", async () => {
    const co = await company();
    expect(
      await setCompanyAddress(db, geocoder, {
        companyId: co.id,
        line: "Av X, 1",
        city: "Linhares",
        state: "ES",
        pilotGateEnabled: true,
      }),
    ).toEqual({ ok: false, error: "outside_pilot" });

    expect(
      (
        await setCompanyAddress(db, geocoder, {
          companyId: co.id,
          line: "Av X, 1",
          city: "Linhares",
          state: "ES",
          pilotGateEnabled: false,
        })
      ).ok,
    ).toBe(true);
  });

  it("guarda FAILED quando a geocodificação não resolve", async () => {
    const co = await company();
    await setCompanyAddress(db, geocoder, {
      companyId: co.id,
      line: "Endereço sem match",
      city: "Colatina",
      state: "ES",
      pilotGateEnabled: false,
    });
    // Colatina resolve; forçamos miss com gate desligado + cidade que o stub não conhece
    await setCompanyAddress(db, geocoder, {
      companyId: co.id,
      line: "Rua Y",
      city: "Vitoria",
      state: "ES",
      pilotGateEnabled: false,
    });
    expect((await getCompanyAddress(db, co.id))?.geocodeStatus).toBe("FAILED");
  });

  it("recusa UF malformada", async () => {
    const co = await company();
    expect(
      await setCompanyAddress(db, geocoder, {
        companyId: co.id,
        line: "Rua",
        city: "Colatina",
        state: "Espirito Santo",
        pilotGateEnabled: false,
      }),
    ).toEqual({ ok: false, error: "invalid" });
  });
});
