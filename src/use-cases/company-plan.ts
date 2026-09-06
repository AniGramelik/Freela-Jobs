import type { CompanyPlanTier, PrismaClient } from "@prisma/client";

import { err, ok, type Result } from "@/domain/index";

export type EffectivePlan = {
  tier: CompanyPlanTier;
  activeJobLimit: number;
};

const DEFAULT_FREE: EffectivePlan = { tier: "FREE", activeJobLimit: 3 };

export async function getCompanyPlan(
  db: PrismaClient,
  companyId: string,
): Promise<EffectivePlan> {
  const plan = await db.companyPlan.findUnique({ where: { companyId } });
  return plan
    ? { tier: plan.tier, activeJobLimit: plan.activeJobLimit }
    : DEFAULT_FREE;
}

/** Suporte: define plano e teto (ADR-0008; billing manual no início). */
export async function setCompanyPlan(
  db: PrismaClient,
  params: { companyId: string; tier: CompanyPlanTier; activeJobLimit?: number },
): Promise<void> {
  await db.companyPlan.upsert({
    where: { companyId: params.companyId },
    create: {
      companyId: params.companyId,
      tier: params.tier,
      activeJobLimit: params.activeJobLimit ?? DEFAULT_FREE.activeJobLimit,
    },
    update: {
      tier: params.tier,
      ...(params.activeJobLimit !== undefined
        ? { activeJobLimit: params.activeJobLimit }
        : {}),
    },
  });
}

/**
 * Gate único de publicação de vaga. Nenhuma função das Etapas 1–2 pode chamar
 * isto — só o fluxo do mural (Etapa 3).
 */
export async function assertCanPublishJob(
  db: PrismaClient,
  companyId: string,
): Promise<Result<void, "job_limit_reached">> {
  const plan = await getCompanyPlan(db, companyId);
  if (plan.tier === "PAID") return ok(undefined);

  const active = await db.jobPosting.count({
    where: { companyId, status: "PUBLISHED" },
  });
  return active < plan.activeJobLimit ? ok(undefined) : err("job_limit_reached");
}
