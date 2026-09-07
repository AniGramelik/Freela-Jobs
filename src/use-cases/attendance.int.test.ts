import type { Company, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  getMyWorkHistory,
  getProfessionalHistoryForCompany,
  recordAttendance,
  submitInternalRating,
} from "./attendance";
import { createCallOut, publishCallOut, respondToCallOut } from "./callouts";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

async function linkedProfessional(company: Company) {
  const p = await db.professionalProfile.create({
    data: {
      fullName: "João",
      phoneE164: `+55279${Math.floor(Math.random() * 1e8)}`,
      createdByCompanyId: company.id,
      state: "CLAIMED",
    },
  });
  await db.workRelationship.create({
    data: {
      companyId: company.id,
      professionalProfileId: p.id,
      state: "ACTIVE",
      roles: ["garçom"],
    },
  });
  return p;
}

async function acceptedCallout(company: Company, profileId: string) {
  const created = await createCallOut(db, {
    companyId: company.id,
    mode: "TARGETED",
    role: "garçom",
    shiftDate: new Date(Date.now() + 86_400_000),
    shiftStart: "18:00",
    location: "Salão",
    targetProfileIds: [profileId],
  });
  if (!created.ok) throw new Error("setup");
  await publishCallOut(db, {
    companyId: company.id,
    callOutId: created.value.callOutId,
  });
  await respondToCallOut(db, {
    callOutId: created.value.callOutId,
    professionalProfileId: profileId,
    action: "accept",
  });
  return created.value.callOutId;
}

describe("presença", () => {
  it("marca COMPLETED/NO_SHOW só a partir de ACCEPTED", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const p = await linkedProfessional(co);
    const callOutId = await acceptedCallout(co, p.id);

    expect(
      await recordAttendance(db, {
        companyId: co.id,
        callOutId,
        professionalProfileId: p.id,
        outcome: "COMPLETED",
      }),
    ).toEqual({ ok: true, value: { state: "COMPLETED" } });

    // já não está mais ACCEPTED
    expect(
      await recordAttendance(db, {
        companyId: co.id,
        callOutId,
        professionalProfileId: p.id,
        outcome: "NO_SHOW",
      }),
    ).toEqual({ ok: false, error: "not_accepted" });
  });

  it("empresa de fora não marca presença", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const other = await db.company.create({ data: { name: "Outra" } });
    const p = await linkedProfessional(co);
    const callOutId = await acceptedCallout(co, p.id);
    expect(
      await recordAttendance(db, {
        companyId: other.id,
        callOutId,
        professionalProfileId: p.id,
        outcome: "COMPLETED",
      }),
    ).toEqual({ ok: false, error: "not_found" });
  });
});

describe("avaliação interna", () => {
  it("exige vínculo e nota 1–5; fica privada da empresa autora", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const p = await linkedProfessional(co);

    expect(
      await submitInternalRating(db, {
        companyId: co.id,
        professionalProfileId: p.id,
        score: 9,
      }),
    ).toEqual({ ok: false, error: "invalid_score" });

    const rating = await submitInternalRating(db, {
      companyId: co.id,
      professionalProfileId: p.id,
      score: 5,
      comment: "excelente",
    });
    expect(rating.ok).toBe(true);

    // o histórico do profissional nunca traz avaliação
    const mine = await getMyWorkHistory(db, { professionalProfileId: p.id });
    expect(JSON.stringify(mine)).not.toContain("excelente");

    // o histórico da empresa traz
    const company = await getProfessionalHistoryForCompany(db, {
      companyId: co.id,
      professionalProfileId: p.id,
    });
    expect(company.ratings).toHaveLength(1);
    expect(company.ratings[0]?.comment).toBe("excelente");
  });

  it("empresa sem vínculo não avalia", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const other = await db.company.create({ data: { name: "Outra" } });
    const p = await linkedProfessional(co);
    expect(
      await submitInternalRating(db, {
        companyId: other.id,
        professionalProfileId: p.id,
        score: 3,
      }),
    ).toEqual({ ok: false, error: "no_relationship" });
  });
});
