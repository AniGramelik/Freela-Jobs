import {
  resolveCompanyContext,
  type CompanyContext,
  type CompanyRole,
  type Membership,
} from "@/domain/authorization";
import { err, ok, type Result } from "@/domain/index";

import type { AuditRecorder } from "./audit";

/**
 * Porta de entrada de autorização de empresa para os casos de uso.
 *
 * `actor` vem da sessão (nunca do corpo/query do request). `requestedCompanyId`
 * é a empresa que o request afirma querer — entrada não confiável, validada
 * aqui contra os `memberships` reais. Toda negativa é auditada.
 */

export type Actor = {
  userId: string;
  memberships: readonly Membership[];
};

export type AuthorizeFailure = {
  status: 403;
  reason: "no_membership" | "insufficient_role";
};

export async function authorizeCompanyAction(params: {
  actor: Actor;
  requestedCompanyId: string;
  action: string;
  requiredRoles?: readonly CompanyRole[];
  audit: AuditRecorder;
}): Promise<Result<CompanyContext, AuthorizeFailure>> {
  const { actor, requestedCompanyId, action, requiredRoles, audit } = params;

  const resolved = resolveCompanyContext({
    memberships: actor.memberships,
    requestedCompanyId,
    requiredRoles,
  });

  if (!resolved.ok) {
    await audit.record({
      actorUserId: actor.userId,
      actingAs: null,
      action: "authorization.denied",
      targetType: "Company",
      targetId: requestedCompanyId,
      after: { attemptedAction: action, reason: resolved.error.reason },
    });
    return err({ status: 403, reason: resolved.error.reason });
  }

  return ok(resolved.value);
}
