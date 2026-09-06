import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  canCompanySeeAvailability,
  getAvailability,
  setAvailabilityWindows,
  setAvailableNow,
} from "./availability";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

async function seedProfile() {
  const co = await db.company.create({ data: { name: "Bar" } });
  const profile = await db.professionalProfile.create({
    data: {
      fullName: "Prof",
      phoneE164: "+5527999123456",
      createdByCompanyId: co.id,
      state: "CLAIMED",
    },
  });
  return { co, profileId: profile.id };
}

describe("disponibilidade", () => {
  it("substitui as janelas e deduplica", async () => {
    const { profileId } = await seedProfile();
    await setAvailabilityWindows(db, {
      professionalProfileId: profileId,
      windows: [
        { weekday: 6, shift: "NIGHT" },
        { weekday: 6, shift: "NIGHT" },
        { weekday: 0, shift: "AFTERNOON" },
      ],
    });
    expect((await getAvailability(db, { professionalProfileId: profileId })).windows).toHaveLength(2);

    await setAvailabilityWindows(db, {
      professionalProfileId: profileId,
      windows: [{ weekday: 5, shift: "MORNING" }],
    });
    const after = await getAvailability(db, { professionalProfileId: profileId });
    expect(after.windows.map((w) => w.weekday)).toEqual([5]);
  });

  it("recusa weekday/shift inválidos", async () => {
    const { profileId } = await seedProfile();
    expect(
      await setAvailabilityWindows(db, {
        professionalProfileId: profileId,
        windows: [{ weekday: 9, shift: "NIGHT" }],
      }),
    ).toEqual({ ok: false, error: "invalid" });
  });

  it("'disponível agora' liga com expiração e some depois do prazo", async () => {
    const { profileId } = await seedProfile();
    await setAvailableNow(db, { professionalProfileId: profileId, on: true });
    expect(
      (await getAvailability(db, { professionalProfileId: profileId })).availableNow,
    ).toBe(true);

    const future = new Date(Date.now() + 9 * 3_600_000);
    expect(
      (
        await getAvailability(db, {
          professionalProfileId: profileId,
          now: future,
        })
      ).availableNow,
    ).toBe(false);

    await setAvailableNow(db, { professionalProfileId: profileId, on: false });
    expect(
      (await getAvailability(db, { professionalProfileId: profileId })).availableNowUntil,
    ).toBeNull();
  });

  it("empresa só vê disponibilidade com vínculo ATIVO", async () => {
    const { co, profileId } = await seedProfile();
    expect(
      await canCompanySeeAvailability(db, {
        companyId: co.id,
        professionalProfileId: profileId,
      }),
    ).toBe(false);

    await db.workRelationship.create({
      data: { companyId: co.id, professionalProfileId: profileId, state: "ACTIVE" },
    });
    expect(
      await canCompanySeeAvailability(db, {
        companyId: co.id,
        professionalProfileId: profileId,
      }),
    ).toBe(true);
  });
});
