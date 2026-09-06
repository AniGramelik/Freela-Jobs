import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";

const db = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

describe("infra de teste de integração", () => {
  it("conecta no Postgres efêmero e a migração inicial está aplicada", async () => {
    const migrations = await db.$queryRaw<
      { migration_name: string }[]
    >`SELECT migration_name FROM _prisma_migrations ORDER BY finished_at`;
    expect(migrations.map((m) => m.migration_name)).toContain(
      "20260906120000_init",
    );
  });

  it("escreve e lê na tabela AuditLog", async () => {
    await db.auditLog.create({
      data: { action: "test.ping", targetType: "Test", targetId: null },
    });
    expect(await db.auditLog.count()).toBe(1);
  });
});
