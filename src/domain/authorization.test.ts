import { describe, expect, it } from "vitest";

import { resolveCompanyContext, type Membership } from "./authorization";

const A: Membership = { companyId: "co_A", role: "OWNER" };
const B_manager: Membership = { companyId: "co_B", role: "MANAGER" };

describe("resolveCompanyContext", () => {
  it("devolve o contexto quando o ator é membro e não há exigência de papel", () => {
    const r = resolveCompanyContext({
      memberships: [A, B_manager],
      requestedCompanyId: "co_A",
    });
    expect(r).toEqual({ ok: true, value: { companyId: "co_A", role: "OWNER" } });
  });

  it("aceita quando o papel do membro está entre os exigidos", () => {
    const r = resolveCompanyContext({
      memberships: [B_manager],
      requestedCompanyId: "co_B",
      requiredRoles: ["OWNER", "MANAGER"],
    });
    expect(r.ok).toBe(true);
  });

  it("nega com insufficient_role quando o papel não basta", () => {
    const r = resolveCompanyContext({
      memberships: [B_manager],
      requestedCompanyId: "co_B",
      requiredRoles: ["OWNER"],
    });
    expect(r).toEqual({
      ok: false,
      error: { reason: "insufficient_role", requestedCompanyId: "co_B" },
    });
  });

  it("nega com no_membership quando o ator não pertence à empresa pedida", () => {
    const r = resolveCompanyContext({
      memberships: [A],
      requestedCompanyId: "co_OUTRA",
    });
    expect(r).toEqual({
      ok: false,
      error: { reason: "no_membership", requestedCompanyId: "co_OUTRA" },
    });
  });

  it("isola empresas: membership em co_A não autoriza co_B", () => {
    const r = resolveCompanyContext({
      memberships: [A],
      requestedCompanyId: "co_B",
    });
    expect(r.ok).toBe(false);
  });
});
