// Sobe um Postgres efêmero (embedded-postgres) e roda o comando passado como
// argumento com DATABASE_URL apontando para ele. Uso:
//   node scripts/with-embedded-pg.mjs "npx prisma migrate dev --name x"
import { execSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("uso: node scripts/with-embedded-pg.mjs \"<comando>\"");
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "freela-pg-scratch-"));
const port = 54331;

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "dev",
  password: "dev",
  port,
  persistent: false,
});

await pg.initialise();
await pg.start();
await pg.createDatabase("freela_dev");
const url = `postgresql://dev:dev@localhost:${port}/freela_dev?schema=public`;

let code = 0;
try {
  execSync(cmd, { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
} catch {
  code = 1;
} finally {
  await pg.stop();
  await rm(dir, { recursive: true, force: true });
}
process.exit(code);
