import type { PrismaClient } from "@prisma/client";

import type { AuditRecorder } from "./audit";

/**
 * Funde perfis duplicados no perfil canônico (ADR-0003, ticket 12). Disparado
 * após o claim, quando o telefone passa a ser verificado. Move vínculos,
 * categorias e convites; marca os duplicados como MERGED.
 */
export async function mergeDuplicateProfiles(
  db: PrismaClient,
  audit: AuditRecorder,
  params: { canonicalId: string },
): Promise<{ mergedCount: number }> {
  const canonical = await db.professionalProfile.findUnique({
    where: { id: params.canonicalId },
  });
  if (!canonical) return { mergedCount: 0 };

  const duplicates = await db.professionalProfile.findMany({
    where: {
      phoneE164: canonical.phoneE164,
      id: { not: canonical.id },
      state: { notIn: ["MERGED", "ANONYMIZED"] },
    },
  });

  for (const dup of duplicates) {
    await db.$transaction(async (tx) => {
      const canonicalRels = await tx.workRelationship.findMany({
        where: { professionalProfileId: canonical.id },
        select: { companyId: true },
      });
      const canonicalCompanies = new Set(canonicalRels.map((r) => r.companyId));

      const dupRels = await tx.workRelationship.findMany({
        where: { professionalProfileId: dup.id },
      });
      for (const rel of dupRels) {
        if (canonicalCompanies.has(rel.companyId)) {
          await tx.workRelationship.delete({ where: { id: rel.id } });
        } else {
          await tx.workRelationship.update({
            where: { id: rel.id },
            data: { professionalProfileId: canonical.id },
          });
        }
      }

      const dupCats = await tx.professionalProfileCategory.findMany({
        where: { professionalProfileId: dup.id },
      });
      for (const cat of dupCats) {
        await tx.professionalProfileCategory.deleteMany({
          where: { professionalProfileId: dup.id, categoryId: cat.categoryId },
        });
        await tx.professionalProfileCategory.upsert({
          where: {
            professionalProfileId_categoryId: {
              professionalProfileId: canonical.id,
              categoryId: cat.categoryId,
            },
          },
          create: {
            professionalProfileId: canonical.id,
            categoryId: cat.categoryId,
          },
          update: {},
        });
      }

      await tx.invite.updateMany({
        where: { professionalProfileId: dup.id },
        data: { professionalProfileId: canonical.id },
      });

      await tx.professionalProfile.update({
        where: { id: dup.id },
        data: { state: "MERGED", mergedIntoId: canonical.id },
      });

      await audit.record({
        actorUserId: null,
        actingAs: "system",
        action: "profile.merged",
        targetType: "ProfessionalProfile",
        targetId: dup.id,
        after: { canonicalId: canonical.id },
      });
    });
  }

  return { mergedCount: duplicates.length };
}

/** Segue a cadeia de merge até o perfil canônico. */
export async function resolveProfileId(
  db: PrismaClient,
  id: string,
): Promise<string> {
  let current = id;
  for (let i = 0; i < 10; i += 1) {
    const profile = await db.professionalProfile.findUnique({
      where: { id: current },
      select: { mergedIntoId: true },
    });
    if (!profile?.mergedIntoId) return current;
    current = profile.mergedIntoId;
  }
  return current;
}
