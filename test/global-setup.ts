import { execSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import EmbeddedPostgres from "embedded-postgres";
import type { TestProject } from "vitest/node";

/**
 * Setup global do projeto de testes de integração.
 *
 * - `TEST_DATABASE_URL` definido (ex.: service container do CI): usa esse banco.
 * - Senão: sobe um PostgreSQL efêmero via `embedded-postgres`, em porta livre e
 *   diretório de dados único (evita colisão de memória compartilhada com
 *   instâncias órfãs de execuções anteriores).
 *
 * Aplica as migrações versionadas e publica a URL para os workers via `provide`.
 */

export default async function setup(project: TestProject) {
  const existing = process.env.TEST_DATABASE_URL;
  if (existing) {
    migrate(existing);
    project.provide("databaseUrl", existing);
    return () => {};
  }

  const dataDir = await mkdtemp(join(tmpdir(), "freela-pg-"));
  const port = await freePort();

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "test",
    password: "test",
    port,
    persistent: false,
  });

  await pg.initialise();
  await pg.start();
  await pg.createDatabase("freela_test");

  const url = `postgresql://test:test@localhost:${port}/freela_test?schema=public`;
  migrate(url);
  project.provide("databaseUrl", url);

  return async () => {
    try {
      await pg.stop();
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  };
}

function migrate(databaseUrl: string): void {
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "ignore",
  });
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, () => {
      const address = srv.address();
      const port =
        typeof address === "object" && address ? address.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

declare module "vitest" {
  interface ProvidedContext {
    databaseUrl: string;
  }
}
