import { PrismaClient } from "@prisma/client";

import { runRetention } from "../src/use-cases/retention";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

runRetention(db, { dryRun: !apply })
  .then((report) => console.log(JSON.stringify(report, null, 2)))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
