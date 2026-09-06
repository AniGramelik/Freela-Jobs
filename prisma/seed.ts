import { PrismaClient } from "@prisma/client";

import { seedPilotCategories } from "../src/use-cases/categories";

const db = new PrismaClient();

async function main() {
  await seedPilotCategories(db);
  const count = await db.professionalCategory.count();
  console.log(`Categorias no piloto: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
