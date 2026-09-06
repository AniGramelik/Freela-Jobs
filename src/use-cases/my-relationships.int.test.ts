import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  archiveRelationship,
  listMyRelationships,
  respondToRelationship,
} from "./my-relationships";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

async function seed() {
  const a = await db.company.create({ data: { name: "Empresa A" } });
  const b = await db.company.create({ data: { name: "Empresa B" } });
  const profile = await db.professionalProfile.create({
    data: {
      fullName: "Prof",
      phoneE164: "+5527999123456",
      createdByCompanyId: a.id,
      state: "CLAIMED",
    },
  });
  const active = await db.workRelationship.create({
    data: {
      companyId: a.id,
      professionalProfileId: profile.id,
      state: "ACTIVE",
      roles: ["garçom"],
      privateNote: "SEGREDO DA EMPRESA",
    },
  });
  const pending = await db.workRelationship.create({
    data: {
      companyId: b.id,
      professionalProfileId: profile.id,
      state: "PENDING_CONSENT",
    },
  });
  return { profileId: profile.id, active, pending };
}

describe("meus vínculos", () => {
  it("lista sem expor a nota privada", async () => {
    const { profileId } = await seed();
    const list = await listMyRelationships(db, { professionalProfileId: profileId });
    expect(list).toHaveLength(2);
    expect(JSON.stringify(list)).not.toContain("SEGREDO");
  });

  it("aceita e recusa vínculos pendentes", async () => {
    const { profileId, pending } = await seed();
    expect(
      await respondToRelationship(db, {
        professionalProfileId: profileId,
        relationshipId: pending.id,
        action: "accept",
      }),
    ).toEqual({ ok: true, value: { state: "ACTIVE" } });

    const another = await db.workRelationship.create({
      data: {
        companyId: (await db.company.create({ data: { name: "C" } })).id,
        professionalProfileId: profileId,
        state: "PENDING_CONSENT",
      },
    });
    expect(
      await respondToRelationship(db, {
        professionalProfileId: profileId,
        relationshipId: another.id,
        action: "decline",
      }),
    ).toEqual({ ok: true, value: { state: "REMOVED" } });
    expect(await db.workRelationship.findUnique({ where: { id: another.id } })).toBeNull();
  });

  it("arquiva vínculo ativo; recusa mexer em vínculo de outro perfil", async () => {
    const { profileId, active } = await seed();
    expect(
      await archiveRelationship(db, {
        professionalProfileId: profileId,
        relationshipId: active.id,
      }),
    ).toEqual({ ok: true, value: { relationshipId: active.id } });
    expect(
      (await db.workRelationship.findUniqueOrThrow({ where: { id: active.id } }))
        .state,
    ).toBe("ARCHIVED");

    expect(
      await archiveRelationship(db, {
        professionalProfileId: "outro-perfil",
        relationshipId: active.id,
      }),
    ).toEqual({ ok: false, error: "not_found" });
  });

  it("não aceita vínculo que não está pendente", async () => {
    const { profileId, active } = await seed();
    expect(
      await respondToRelationship(db, {
        professionalProfileId: profileId,
        relationshipId: active.id,
        action: "accept",
      }),
    ).toEqual({ ok: false, error: "not_pending" });
  });
});
