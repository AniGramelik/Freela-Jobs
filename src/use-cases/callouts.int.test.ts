import type { Company, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  cancelCallOut,
  createCallOut,
  publishCallOut,
  respondToCallOut,
} from "./callouts";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const future = () => new Date(Date.now() + 3 * 24 * 3_600_000);

async function professional(company: Company, roles: string[], over = {}) {
  const p = await db.professionalProfile.create({
    data: {
      fullName: `P${Math.random()}`,
      phoneE164: `+55279${Math.floor(Math.random() * 100_000_000)}`,
      createdByCompanyId: company.id,
      state: "CLAIMED",
      ...over,
    },
  });
  await db.workRelationship.create({
    data: {
      companyId: company.id,
      professionalProfileId: p.id,
      state: "ACTIVE",
      roles,
    },
  });
  return p;
}

describe("convocação direcionada", () => {
  it("cria, publica com OFFERED e notifica; aceite preenche e lota", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const a = await professional(co, ["garçom"]);
    const b = await professional(co, ["garçom"]);

    const created = await createCallOut(db, {
      companyId: co.id,
      mode: "TARGETED",
      role: "garçom",
      shiftDate: future(),
      shiftStart: "18:00",
      location: "Salão",
      quantity: 1,
      targetProfileIds: [a.id, b.id],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const pub = await publishCallOut(db, {
      companyId: co.id,
      callOutId: created.value.callOutId,
    });
    expect(pub).toEqual({ ok: true, value: { recipients: 2 } });
    expect(
      await db.outboxMessage.count({ where: { dedupeKey: { startsWith: "callout:" } } }),
    ).toBe(1);

    const first = await respondToCallOut(db, {
      callOutId: created.value.callOutId,
      professionalProfileId: a.id,
      action: "accept",
    });
    expect(first).toEqual({ ok: true, value: { state: "ACCEPTED" } });
    expect(
      (
        await db.callOut.findUniqueOrThrow({
          where: { id: created.value.callOutId },
        })
      ).status,
    ).toBe("FILLED");

    // segundo aceite é barrado (lotado)
    expect(
      await respondToCallOut(db, {
        callOutId: created.value.callOutId,
        professionalProfileId: b.id,
        action: "accept",
      }),
    ).toEqual({ ok: false, error: "full" });
  });

  it("recusa alvos sem vínculo ativo", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const other = await db.company.create({ data: { name: "Outra" } });
    const alien = await professional(other, ["garçom"]);
    expect(
      await createCallOut(db, {
        companyId: co.id,
        mode: "TARGETED",
        role: "garçom",
        shiftDate: future(),
        shiftStart: "18:00",
        location: "x",
        targetProfileIds: [alien.id],
      }),
    ).toEqual({ ok: false, error: "targets_not_linked" });
  });

  it("desistência de vaga lotada reabre a convocação", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const a = await professional(co, ["segurança"]);
    const created = await createCallOut(db, {
      companyId: co.id,
      mode: "TARGETED",
      role: "segurança",
      shiftDate: future(),
      shiftStart: "22:00",
      location: "Porta",
      quantity: 1,
      targetProfileIds: [a.id],
    });
    if (!created.ok) throw new Error("setup");
    await publishCallOut(db, { companyId: co.id, callOutId: created.value.callOutId });
    await respondToCallOut(db, {
      callOutId: created.value.callOutId,
      professionalProfileId: a.id,
      action: "accept",
    });
    await respondToCallOut(db, {
      callOutId: created.value.callOutId,
      professionalProfileId: a.id,
      action: "withdraw",
    });
    expect(
      (
        await db.callOut.findUniqueOrThrow({
          where: { id: created.value.callOutId },
        })
      ).status,
    ).toBe("OPEN");
  });
});

describe("convocação aberta", () => {
  it("fan-out para vínculos ativos com a função, ordenando disponíveis primeiro", async () => {
    const co = await db.company.create({ data: { name: "Buffet" } });
    await professional(co, ["garçom"], {
      availableNowUntil: new Date(Date.now() + 3_600_000),
    });
    await professional(co, ["garçom"]);
    await professional(co, ["cozinha"]); // função diferente, não entra

    const created = await createCallOut(db, {
      companyId: co.id,
      mode: "OPEN",
      role: "garçom",
      shiftDate: future(),
      shiftStart: "12:00",
      location: "Evento",
      quantity: 3,
    });
    if (!created.ok) throw new Error("setup");

    const pub = await publishCallOut(db, {
      companyId: co.id,
      callOutId: created.value.callOutId,
    });
    expect(pub).toEqual({ ok: true, value: { recipients: 2 } });
  });
});

describe("cancelar convocação", () => {
  it("marca CANCELLED e barra resposta posterior", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const a = await professional(co, ["garçom"]);
    const created = await createCallOut(db, {
      companyId: co.id,
      mode: "TARGETED",
      role: "garçom",
      shiftDate: future(),
      shiftStart: "18:00",
      location: "x",
      targetProfileIds: [a.id],
    });
    if (!created.ok) throw new Error("setup");
    await publishCallOut(db, { companyId: co.id, callOutId: created.value.callOutId });
    await cancelCallOut(db, { companyId: co.id, callOutId: created.value.callOutId });

    expect(
      await respondToCallOut(db, {
        callOutId: created.value.callOutId,
        professionalProfileId: a.id,
        action: "accept",
      }),
    ).toEqual({ ok: false, error: "not_open" });
  });
});
