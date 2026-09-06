import type {
  PrismaClient,
  ProfessionalProfileState,
  WorkRelationshipState,
} from "@prisma/client";

import { toE164 } from "@/domain/phone";
import { err, ok, type Result } from "@/domain/index";

import { setProfessionalCategories } from "./categories";

export type RegisterManagedInput = {
  companyId: string;
  fullName: string;
  phone: string;
  email?: string | null;
  roles?: string[];
  sourceNote?: string | null;
  privateNote?: string | null;
  categorySlugs?: string[];
};

export type RegisterManagedError =
  | "invalid_name"
  | "invalid_phone"
  | "already_linked";

/**
 * Cadastra um profissional que a empresa já usa (perfil gerenciado) e cria o
 * vínculo. Se já existe um perfil ativo com aquele telefone, NÃO cria
 * duplicado: só adiciona o vínculo da empresa ao perfil existente (ADR-0003).
 */
export async function registerManagedProfessional(
  db: PrismaClient,
  input: RegisterManagedInput,
): Promise<
  Result<
    { professionalProfileId: string; relationshipId: string; reused: boolean },
    RegisterManagedError
  >
> {
  const fullName = input.fullName.trim();
  if (fullName.length < 2) return err("invalid_name");

  const phone = toE164(input.phone);
  if (!phone.ok) return err("invalid_phone");
  const phoneE164 = phone.value;

  const existing = await db.professionalProfile.findFirst({
    where: { phoneE164, state: { notIn: ["ANONYMIZED", "MERGED"] } },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    const already = await db.workRelationship.findUnique({
      where: {
        companyId_professionalProfileId: {
          companyId: input.companyId,
          professionalProfileId: existing.id,
        },
      },
    });
    if (already) return err("already_linked");

    const relationship = await db.workRelationship.create({
      data: {
        companyId: input.companyId,
        professionalProfileId: existing.id,
        roles: input.roles ?? [],
        privateNote: input.privateNote ?? null,
      },
    });
    return ok({
      professionalProfileId: existing.id,
      relationshipId: relationship.id,
      reused: true,
    });
  }

  const created = await db.$transaction(async (tx) => {
    const profile = await tx.professionalProfile.create({
      data: {
        fullName,
        phoneE164,
        email: input.email?.trim() || null,
        createdByCompanyId: input.companyId,
        sourceNote: input.sourceNote?.trim() || null,
      },
    });
    const relationship = await tx.workRelationship.create({
      data: {
        companyId: input.companyId,
        professionalProfileId: profile.id,
        roles: input.roles ?? [],
        privateNote: input.privateNote ?? null,
      },
    });
    if (input.categorySlugs && input.categorySlugs.length > 0) {
      await setProfessionalCategories(tx, {
        professionalProfileId: profile.id,
        slugs: input.categorySlugs,
      });
    }
    return { profileId: profile.id, relationshipId: relationship.id };
  });

  return ok({
    professionalProfileId: created.profileId,
    relationshipId: created.relationshipId,
    reused: false,
  });
}

export type CompanyProfessional = {
  relationshipId: string;
  relationshipState: WorkRelationshipState;
  roles: string[];
  privateNote: string | null;
  profileId: string;
  profileState: ProfessionalProfileState;
  fullName: string;
  phoneE164: string;
  email: string | null;
};

/** Lista o acervo da empresa, com busca por nome, telefone ou função exata. */
export async function listCompanyProfessionals(
  db: PrismaClient,
  params: { companyId: string; query?: string },
): Promise<CompanyProfessional[]> {
  const q = params.query?.trim();
  const rows = await db.workRelationship.findMany({
    where: {
      companyId: params.companyId,
      ...(q
        ? {
            OR: [
              {
                professionalProfile: {
                  fullName: { contains: q, mode: "insensitive" },
                },
              },
              {
                professionalProfile: {
                  phoneE164: { contains: q.replace(/\D/g, "") || q },
                },
              },
              { roles: { has: q.toLowerCase() } },
            ],
          }
        : {}),
    },
    include: { professionalProfile: true },
    orderBy: { professionalProfile: { fullName: "asc" } },
  });

  return rows.map((r) => ({
    relationshipId: r.id,
    relationshipState: r.state,
    roles: r.roles,
    privateNote: r.privateNote,
    profileId: r.professionalProfile.id,
    profileState: r.professionalProfile.state,
    fullName: r.professionalProfile.fullName,
    phoneE164: r.professionalProfile.phoneE164,
    email: r.professionalProfile.email,
  }));
}

/** Atualiza funções e nota privada do vínculo — escopado à empresa dona. */
export async function updateWorkRelationship(
  db: PrismaClient,
  params: {
    companyId: string;
    relationshipId: string;
    roles?: string[];
    privateNote?: string | null;
  },
): Promise<Result<{ relationshipId: string }, "not_found">> {
  const rel = await db.workRelationship.findUnique({
    where: { id: params.relationshipId },
  });
  if (!rel || rel.companyId !== params.companyId) return err("not_found");

  await db.workRelationship.update({
    where: { id: params.relationshipId },
    data: {
      ...(params.roles ? { roles: params.roles } : {}),
      ...(params.privateNote !== undefined
        ? { privateNote: params.privateNote }
        : {}),
    },
  });
  return ok({ relationshipId: params.relationshipId });
}
