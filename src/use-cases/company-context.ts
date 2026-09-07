import type { PrismaClient } from "@prisma/client";

import {
  resolveActiveCompany,
  type CompanyOption,
} from "@/domain/company-context";
import { err, ok, type Result } from "@/domain/index";

import type { AuditRecorder } from "./audit";
import { authorizeCompanyAction, type Actor } from "./authorize";

export function toActor(user: {
  id: string;
  memberships: readonly { companyId: string; role: "OWNER" | "MANAGER" }[];
}): Actor {
  return {
    userId: user.id,
    memberships: user.memberships.map((m) => ({
      companyId: m.companyId,
      role: m.role,
    })),
  };
}

/**
 * Troca a empresa "agindo como" da sessão. Valida a associação via
 * `authorizeCompanyAction` (ticket 04) — empresa sem membership → 403 auditado.
 */
export async function setActiveCompany(
  db: PrismaClient,
  audit: AuditRecorder,
  params: { actor: Actor; sessionId: string; requestedCompanyId: string },
): Promise<Result<{ companyId: string }, { status: 403 }>> {
  const authorized = await authorizeCompanyAction({
    actor: params.actor,
    requestedCompanyId: params.requestedCompanyId,
    action: "company.switch_context",
    audit,
  });
  if (!authorized.ok) return err({ status: 403 });

  await db.session.update({
    where: { id: params.sessionId },
    data: { activeCompanyId: params.requestedCompanyId },
  });
  return ok({ companyId: params.requestedCompanyId });
}

export type SessionContext = {
  user: { id: string; email: string };
  companies: CompanyOption[];
  activeCompany: CompanyOption | null;
  professionalProfileId: string | null;
};

export async function loadSessionContext(
  db: PrismaClient,
  params: { userId: string; storedActiveCompanyId: string | null },
): Promise<SessionContext | null> {
  const [user, profile] = await Promise.all([
    db.user.findUnique({
      where: { id: params.userId },
      include: { memberships: { include: { company: true } } },
    }),
    db.professionalProfile.findFirst({
      where: { ownerUserId: params.userId, state: "CLAIMED" },
      select: { id: true },
    }),
  ]);
  if (!user || user.blockedAt) return null;

  const companies: CompanyOption[] = user.memberships
    .map((m) => ({ id: m.company.id, name: m.company.name, role: m.role }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    user: { id: user.id, email: user.email },
    companies,
    activeCompany: resolveActiveCompany(companies, params.storedActiveCompanyId),
    professionalProfileId: profile?.id ?? null,
  };
}
