// Dev local sem Docker: sobe um Postgres efêmero (embedded-postgres), aplica
// migrações + seed, e roda `next dev` apontando para ele. Ctrl+C encerra tudo.
import { execSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const dir = await mkdtemp(join(tmpdir(), "freela-dev-pg-"));
const port = 54350;
const url = `postgresql://dev:dev@localhost:${port}/freela_dev?schema=public`;

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "dev",
  password: "dev",
  port,
  persistent: false,
});

console.log("[dev-pg] initialise...");
await pg.initialise();
await pg.start();
await pg.createDatabase("freela_dev");

const env = { ...process.env, DATABASE_URL: url, NODE_ENV: "development" };
console.log("[dev-pg] migrate + seed...");
execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
execSync("npm run db:seed", { env, stdio: "inherit" });

console.log(`[dev-pg] DATABASE_URL=${url}`);
console.log("[dev-pg] starting next dev on http://localhost:3000 ...");
const dev = spawn("npm", ["run", "dev"], { env, stdio: "inherit", shell: true });

async function shutdown() {
  dev.kill();
  try {
    await pg.stop();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
dev.on("exit", shutdown);
