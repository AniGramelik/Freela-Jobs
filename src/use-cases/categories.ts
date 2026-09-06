import type { PrismaClient, ProfessionalCategory } from "@prisma/client";

import type { DbClient } from "./db";

/** Categorias ativadas no piloto (operacionais/eventuais). Reguladas: ticket 26+. */
export const PILOT_CATEGORIES: { slug: string; name: string }[] = [
  { slug: "garcom", name: "Garçom / Garçonete" },
  { slug: "cozinha", name: "Cozinha / Chapa" },
  { slug: "bar", name: "Bar / Barista" },
  { slug: "seguranca", name: "Segurança" },
  { slug: "apoio-eventos", name: "Apoio de eventos" },
  { slug: "limpeza", name: "Limpeza" },
  { slug: "recepcao", name: "Recepção / Portaria" },
];

export async function seedPilotCategories(db: DbClient): Promise<void> {
  for (const c of PILOT_CATEGORIES) {
    await db.professionalCategory.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, active: true },
      update: { name: c.name },
    });
  }
}

export function listActiveCategories(
  db: PrismaClient,
): Promise<ProfessionalCategory[]> {
  return db.professionalCategory.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export async function setProfessionalCategories(
  db: DbClient,
  params: { professionalProfileId: string; slugs: string[] },
): Promise<void> {
  const slugs = [...new Set(params.slugs.filter(Boolean))];
  const categories = await db.professionalCategory.findMany({
    where: { slug: { in: slugs }, active: true },
    select: { id: true },
  });

  await db.professionalProfileCategory.deleteMany({
    where: { professionalProfileId: params.professionalProfileId },
  });
  if (categories.length > 0) {
    await db.professionalProfileCategory.createMany({
      data: categories.map((c) => ({
        professionalProfileId: params.professionalProfileId,
        categoryId: c.id,
      })),
    });
  }
}
