import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  listActiveCategories,
  seedPilotCategories,
  setProfessionalCategories,
} from "./categories";
import { registerManagedProfessional } from "./professionals";

const db: PrismaClient = getTestDb();

beforeEach(async () => {
  await resetDb(db);
  await seedPilotCategories(db);
});
afterAll(() => db.$disconnect());

describe("categorias", () => {
  it("seed é idempotente e lista só as ativas", async () => {
    await seedPilotCategories(db);
    const active = await listActiveCategories(db);
    expect(active.length).toBe(7);
    expect(active.map((c) => c.slug)).toContain("garcom");

    await db.professionalCategory.update({
      where: { slug: "limpeza" },
      data: { active: false },
    });
    expect((await listActiveCategories(db)).length).toBe(6);
  });

  it("associa categorias a um perfil e substitui no set seguinte", async () => {
    const co = await db.company.create({ data: { name: "A" } });
    const reg = await registerManagedProfessional(db, {
      companyId: co.id,
      fullName: "João",
      phone: "27999123456",
      categorySlugs: ["garcom", "bar", "inexistente"],
    });
    if (!reg.ok) throw new Error("setup");

    const first = await db.professionalProfileCategory.findMany({
      where: { professionalProfileId: reg.value.professionalProfileId },
      include: { category: true },
    });
    expect(first.map((r) => r.category.slug).sort()).toEqual(["bar", "garcom"]);

    await setProfessionalCategories(db, {
      professionalProfileId: reg.value.professionalProfileId,
      slugs: ["seguranca"],
    });
    const second = await db.professionalProfileCategory.findMany({
      where: { professionalProfileId: reg.value.professionalProfileId },
      include: { category: true },
    });
    expect(second.map((r) => r.category.slug)).toEqual(["seguranca"]);
  });
});
