import { err, ok, type Result } from "./index";

/**
 * Resolução pura de contexto de empresa (ADR-0002).
 *
 * O chamador (camada de casos de uso / rota) passa:
 *  - `memberships`: os vínculos REAIS do ator, derivados da sessão — nunca do
 *    cliente;
 *  - `requestedCompanyId`: a empresa que a requisição diz querer agir — entrada
 *    NÃO confiável.
 *
 * A função só devolve contexto se o ator de fato pertence àquela empresa (e,
 * quando exigido, com papel suficiente). Um `companyId` forjado simplesmente
 * não encontra membership e cai em `no_membership`.
 */

export type CompanyRole = "OWNER" | "MANAGER";

export type Membership = {
  companyId: string;
  role: CompanyRole;
};

export type CompanyContext = {
  companyId: string;
  role: CompanyRole;
};

export type AuthorizationDenied = {
  reason: "no_membership" | "insufficient_role";
  requestedCompanyId: string;
};

export function resolveCompanyContext(params: {
  memberships: readonly Membership[];
  requestedCompanyId: string;
  requiredRoles?: readonly CompanyRole[];
}): Result<CompanyContext, AuthorizationDenied> {
  const { memberships, requestedCompanyId, requiredRoles } = params;

  const membership = memberships.find(
    (m) => m.companyId === requestedCompanyId,
  );

  if (!membership) {
    return err({ reason: "no_membership", requestedCompanyId });
  }

  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    return err({ reason: "insufficient_role", requestedCompanyId });
  }

  return ok({ companyId: membership.companyId, role: membership.role });
}
