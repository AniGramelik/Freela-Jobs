import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { InMemoryAuditRecorder } from "./audit";
import {
  loadSessionContext,
  setActiveCompany,
  toActor,
} from "./company-context";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

async function seedUserInCompanies(names: string[]) {
  const user = await db.user.create({
    data: { email: `u${Date.now()}@x.com`, emailVerifiedAt: new Date() },
  });
  const companies = [];
  for (const name of names) {
    const company = await db.company.create({ data: { name } });
    await db.companyMembership.create({
      data: { userId: user.id, companyId: company.id, role: "OWNER" },
    });
    companies.push(company);
  }
  const session = await db.session.create({
    data: {
      userId: user.id,
      tokenHash: `h${Date.now()}${Math.random()}`,
      expiresAt: new Date(Date.now() + 3_600_000),
    },
  });
  const withMemberships = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { memberships: true },
  });
  return { user: withMemberships, companies, session };
}

describe("setActiveCompany", () => {
  it("troca o contexto da sessão para uma empresa do usuário", async () => {
    const { user, companies, session } = await seedUserInCompanies(["A", "B"]);
    const audit = new InMemoryAuditRecorder();

    const result = await setActiveCompany(db, audit, {
      actor: toActor(user),
      sessionId: session.id,
      requestedCompanyId: companies[1]!.id,
    });

    expect(result).toEqual({ ok: true, value: { companyId: companies[1]!.id } });
    expect(
      (await db.session.findUniqueOrThrow({ where: { id: session.id } }))
        .activeCompanyId,
    ).toBe(companies[1]!.id);
    expect(audit.entries).toHaveLength(0);
  });

  it("nega e audita troca para empresa sem membership", async () => {
    const { user, session } = await seedUserInCompanies(["A"]);
    const outra = await db.company.create({ data: { name: "Alheia" } });
    const audit = new InMemoryAuditRecorder();

    const result = await setActiveCompany(db, audit, {
      actor: toActor(user),
      sessionId: session.id,
      requestedCompanyId: outra.id,
    });

    expect(result).toEqual({ ok: false, error: { status: 403 } });
    expect(
      (await db.session.findUniqueOrThrow({ where: { id: session.id } }))
        .activeCompanyId,
    ).toBeNull();
    expect(audit.entries[0]?.action).toBe("authorization.denied");
    expect(audit.entries[0]?.targetId).toBe(outra.id);
  });
});

describe("loadSessionContext", () => {
  it("sem id guardado usa a primeira empresa (ordem alfabética)", async () => {
    const { user } = await seedUserInCompanies(["Zebra", "Alfa"]);
    const ctx = await loadSessionContext(db, {
      userId: user.id,
      storedActiveCompanyId: null,
    });
    expect(ctx?.activeCompany?.name).toBe("Alfa");
  });

  it("id guardado válido é respeitado; inválido cai para a primeira", async () => {
    const { user, companies } = await seedUserInCompanies(["Alfa", "Beta"]);

    const valid = await loadSessionContext(db, {
      userId: user.id,
      storedActiveCompanyId: companies[1]!.id,
    });
    expect(valid?.activeCompany?.name).toBe("Beta");

    const invalid = await loadSessionContext(db, {
      userId: user.id,
      storedActiveCompanyId: "co_inexistente",
    });
    expect(invalid?.activeCompany?.name).toBe("Alfa");
  });
});
