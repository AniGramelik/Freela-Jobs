import { describe, expect, it } from "vitest";

import { InMemoryAuditRecorder } from "./audit";
import { authorizeCompanyAction, type Actor } from "./authorize";

const actorInAandC: Actor = {
  userId: "user_1",
  memberships: [
    { companyId: "co_A", role: "OWNER" },
    { companyId: "co_C", role: "MANAGER" },
  ],
};

describe("authorizeCompanyAction", () => {
  it("autoriza ação na empresa da qual o ator é membro, sem auditar", async () => {
    const audit = new InMemoryAuditRecorder();
    const r = await authorizeCompanyAction({
      actor: actorInAandC,
      requestedCompanyId: "co_A",
      action: "callout.create",
      audit,
    });

    expect(r).toEqual({
      ok: true,
      value: { companyId: "co_A", role: "OWNER" },
    });
    expect(audit.entries).toHaveLength(0);
  });

  it("nega com 403 e audita quando o ator não é membro da empresa pedida", async () => {
    const audit = new InMemoryAuditRecorder();
    const r = await authorizeCompanyAction({
      actor: actorInAandC,
      requestedCompanyId: "co_B",
      action: "callout.create",
      audit,
    });

    expect(r).toEqual({
      ok: false,
      error: { status: 403, reason: "no_membership" },
    });
    expect(audit.entries).toEqual([
      {
        actorUserId: "user_1",
        actingAs: null,
        action: "authorization.denied",
        targetType: "Company",
        targetId: "co_B",
        after: { attemptedAction: "callout.create", reason: "no_membership" },
      },
    ]);
  });

  it("nega com 403 e audita quando o papel é insuficiente", async () => {
    const audit = new InMemoryAuditRecorder();
    const r = await authorizeCompanyAction({
      actor: actorInAandC,
      requestedCompanyId: "co_C",
      action: "company.settings.update",
      requiredRoles: ["OWNER"],
      audit,
    });

    expect(r).toEqual({
      ok: false,
      error: { status: 403, reason: "insufficient_role" },
    });
    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]?.action).toBe("authorization.denied");
    expect(audit.entries[0]?.after).toEqual({
      attemptedAction: "company.settings.update",
      reason: "insufficient_role",
    });
  });

  it("isola empresas: o mesmo ator é autorizado em co_A e negado em co_B", async () => {
    const audit = new InMemoryAuditRecorder();

    const okA = await authorizeCompanyAction({
      actor: actorInAandC,
      requestedCompanyId: "co_A",
      action: "x",
      audit,
    });
    const denyB = await authorizeCompanyAction({
      actor: actorInAandC,
      requestedCompanyId: "co_B",
      action: "x",
      audit,
    });

    expect(okA.ok).toBe(true);
    expect(denyB.ok).toBe(false);
    expect(audit.entries.map((e) => e.targetId)).toEqual(["co_B"]);
  });
});
