import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  hasActiveConsent,
  recordConsent,
  revokeConsent,
  setNotificationOptOut,
} from "./consent";
import {
  anonymizeProfile,
  exportMyData,
  requestDataDeletion,
} from "./data-subject";
import { runRetention } from "./retention";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

describe("consentimento", () => {
  it("append-only: revogar é novo registro; vigente é o mais recente", async () => {
    const s = { subjectType: "professional_profile", subjectId: "p1" };
    await recordConsent(db, { ...s, type: "public_visibility", textVersion: "v1" });
    expect(await hasActiveConsent(db, { ...s, type: "public_visibility" })).toBe(
      true,
    );

    await revokeConsent(db, { ...s, type: "public_visibility" });
    expect(await hasActiveConsent(db, { ...s, type: "public_visibility" })).toBe(
      false,
    );
    expect(await db.consent.count()).toBe(2);
  });

  it("categoria transacional não aceita opt-out", async () => {
    expect(
      await setNotificationOptOut(db, {
        subjectId: "p1",
        category: "callout",
        optOut: true,
      }),
    ).toEqual({ ok: false, error: "transactional_category" });

    expect(
      (
        await setNotificationOptOut(db, {
          subjectId: "p1",
          category: "digest",
          optOut: true,
        })
      ).ok,
    ).toBe(true);
    expect(await db.notificationOptOut.count()).toBe(1);
  });
});

describe("direitos do titular", () => {
  async function seedClaimed() {
    const co = await db.company.create({ data: { name: "Bar" } });
    const user = await db.user.create({
      data: { email: "prof@x.com", emailVerifiedAt: new Date() },
    });
    const profile = await db.professionalProfile.create({
      data: {
        fullName: "João",
        phoneE164: "+5527999123456",
        email: "prof@x.com",
        createdByCompanyId: co.id,
        state: "CLAIMED",
        ownerUserId: user.id,
      },
    });
    await db.workRelationship.create({
      data: {
        companyId: co.id,
        professionalProfileId: profile.id,
        state: "ACTIVE",
        privateNote: "SEGREDO",
      },
    });
    return { user, profile };
  }

  it("exporta os dados do titular sem nota privada de empresa", async () => {
    const { user } = await seedClaimed();
    const data = await exportMyData(db, { userId: user.id });
    expect(JSON.stringify(data)).not.toContain("SEGREDO");
    expect(JSON.stringify(data)).toContain("+5527999123456");
  });

  it("pedido de exclusão cria DataSubjectRequest com prazo", async () => {
    const { user } = await seedClaimed();
    const req = await requestDataDeletion(db, { userId: user.id });
    expect(req.dueAt.getTime()).toBeGreaterThan(Date.now());
    expect(
      (await db.dataSubjectRequest.findUniqueOrThrow({ where: { id: req.requestId } }))
        .type,
    ).toBe("DELETION");
  });

  it("anonimiza o perfil mantendo o vínculo pseudonimizado", async () => {
    const { profile } = await seedClaimed();
    await db.availabilityWindow.create({
      data: { professionalProfileId: profile.id, weekday: 1, shift: "NIGHT" },
    });

    const result = await anonymizeProfile(db, {
      professionalProfileId: profile.id,
    });
    expect(result.ok).toBe(true);

    const after = await db.professionalProfile.findUniqueOrThrow({
      where: { id: profile.id },
    });
    expect(after.state).toBe("ANONYMIZED");
    expect(after.fullName).toBe("Profissional removido");
    expect(after.email).toBeNull();
    expect(after.phoneE164.startsWith("anon:")).toBe(true);
    expect(
      await db.availabilityWindow.count({
        where: { professionalProfileId: profile.id },
      }),
    ).toBe(0);
    // o vínculo continua existindo
    expect(
      await db.workRelationship.count({
        where: { professionalProfileId: profile.id },
      }),
    ).toBe(1);
  });
});

describe("retenção", () => {
  it("dry-run relata sem alterar; apply anonimiza e expira", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const old = new Date(Date.now() - 200 * 86_400_000);
    const idle = await db.professionalProfile.create({
      data: {
        fullName: "Parado",
        phoneE164: "+5527990000000",
        createdByCompanyId: co.id,
        state: "MANAGED",
        createdAt: old,
      },
    });
    await db.invite.create({
      data: {
        professionalProfileId: idle.id,
        companyId: co.id,
        tokenHash: "h1",
        channel: "email",
        state: "PENDING",
        expiresAt: new Date(Date.now() - 86_400_000),
      },
    });

    const dry = await runRetention(db, { dryRun: true });
    expect(dry.dryRun).toBe(true);
    expect(dry.profilesAnonymized).toBe(1);
    expect(dry.invitesExpired).toBe(1);
    expect(
      (await db.professionalProfile.findUniqueOrThrow({ where: { id: idle.id } }))
        .state,
    ).toBe("MANAGED"); // nada mudou

    const applied = await runRetention(db, { dryRun: false });
    expect(applied.profilesAnonymized).toBe(1);
    expect(
      (await db.professionalProfile.findUniqueOrThrow({ where: { id: idle.id } }))
        .state,
    ).toBe("ANONYMIZED");
    expect(
      (await db.invite.findFirstOrThrow({ where: { professionalProfileId: idle.id } }))
        .state,
    ).toBe("EXPIRED");
  });
});
