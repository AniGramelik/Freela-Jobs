import { PrismaClient } from "@prisma/client";
import { inject } from "vitest";

/**
 * Cliente Prisma ligado ao banco de teste (provido pelo global-setup).
 * Os casos de uso recebem este cliente como contexto transacional — nunca
 * importam o singleton de `src/lib/prisma.ts` nos testes.
 */
export function getTestDb(): PrismaClient {
  return new PrismaClient({
    datasourceUrl: inject("databaseUrl"),
    log: [],
  });
}

/** Zera todas as tabelas (menos o histórico de migração) entre os testes. */
export async function resetDb(db: PrismaClient): Promise<void> {
  const rows = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  if (rows.length === 0) return;
  const list = rows.map((r) => `"${r.tablename}"`).join(", ");
  await db.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
  );
}
