import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { InMemoryAuditRecorder } from "./audit";
import { hasActiveConsent } from "./consent";
import { blockUser, reportContent } from "./moderation";
import {
  revokePublicVisibility,
  setPublicReputationOptIn,
  setPublicVisibility,
} from "./public-listing";
import {
  aggregateReputation,
  invitePublicProfessional,
  searchPublicNetwork,
} from "./public-search";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

async function claimedProfileInColatina(fullName: string) {
  const co = await db.company.create({ data: { name: `dono-${fullName}` } });
  return db.professionalProfile.create({
    data: {
      fullName,
      phoneE164: `+55279${Math.floor(Math.random() * 1e8)}`,
      createdByCompanyId: co.id,
      state: "CLAIMED",
      baseCity: "Colatina",
      baseState: "ES",
      latitude: -19.5386,
      longitude: -40.6306,
    },
  });
}

async function companyWithAddress() {
  const co = await db.company.create({ data: { name: "Buffet" } });
  await db.companyAddress.create({
    data: {
      companyId: co.id,
      line: "Centro",
      city: "Colatina",
      state: "ES",
      latitude: -19.54,
      longitude: -40.63,
      geocodeStatus: "OK",
      radiusKm: 20,
    },
  });
  return co;
}

describe("visibilidade pública", () => {
  it("opt-in grava consentimento; revogar tira da busca", async () => {
    const p = await claimedProfileInColatina("Ana");
    await setPublicVisibility(db, {
      professionalProfileId: p.id,
      roles: ["Garçom"],
    });
    expect(
      await hasActiveConsent(db, {
        subjectType: "professional_profile",
        subjectId: p.id,
        type: "public_visibility",
      }),
    ).toBe(true);

    const co = await companyWithAddress();
    expect(
      await searchPublicNetwork(db, { companyId: co.id, role: "garçom" }),
    ).toHaveLength(1);

    await revokePublicVisibility(db, { professionalProfileId: p.id });
    expect(
      await searchPublicNetwork(db, { companyId: co.id, role: "garçom" }),
    ).toHaveLength(0);
  });
});

describe("busca na rede", () => {
  it("filtra por função e raio, esconde telefone e já-vinculados", async () => {
    const near = await claimedProfileInColatina("Perto");
    const far = await claimedProfileInColatina("Longe");
    await db.professionalProfile.update({
      where: { id: far.id },
      data: { latitude: -20.3, longitude: -40.3 }, // ~120 km
    });
    await setPublicVisibility(db, {
      professionalProfileId: near.id,
      roles: ["garçom"],
      showPhone: false,
    });
    await setPublicVisibility(db, {
      professionalProfileId: far.id,
      roles: ["garçom"],
    });

    const co = await companyWithAddress();
    const results = await searchPublicNetwork(db, {
      companyId: co.id,
      role: "garçom",
    });
    expect(results.map((r) => r.fullName)).toEqual(["Perto"]);
    expect(results[0]?.phone).toBeNull();

    // convidar cria vínculo pendente; some da busca depois
    const invited = await invitePublicProfessional(db, {
      companyId: co.id,
      professionalProfileId: near.id,
    });
    expect(invited.ok).toBe(true);
    expect(
      await searchPublicNetwork(db, { companyId: co.id, role: "garçom" }),
    ).toHaveLength(0);
  });
});

describe("reputação pública", () => {
  it("só aparece com opt-in, agregada e sem comentários", async () => {
    const p = await claimedProfileInColatina("Zé");
    const c1 = await db.company.create({ data: { name: "C1" } });
    const c2 = await db.company.create({ data: { name: "C2" } });
    await db.internalRating.createMany({
      data: [
        { companyId: c1.id, professionalProfileId: p.id, score: 5, comment: "top" },
        { companyId: c2.id, professionalProfileId: p.id, score: 4 },
      ],
    });

    expect(await aggregateReputation(db, p.id)).toEqual({
      average: 4.5,
      count: 2,
    });

    await setPublicVisibility(db, {
      professionalProfileId: p.id,
      roles: ["garçom"],
    });
    const co = await companyWithAddress();
    let results = await searchPublicNetwork(db, {
      companyId: co.id,
      role: "garçom",
    });
    expect(results[0]?.reputation).toBeNull();

    await setPublicReputationOptIn(db, {
      professionalProfileId: p.id,
      on: true,
    });
    results = await searchPublicNetwork(db, { companyId: co.id, role: "garçom" });
    expect(results[0]?.reputation).toEqual({ average: 4.5, count: 2 });
    expect(JSON.stringify(results)).not.toContain("top");
  });
});

describe("moderação", () => {
  it("denúncia registra; bloquear usuário derruba sessões e audita", async () => {
    const user = await db.user.create({
      data: { email: "x@x.com", emailVerifiedAt: new Date() },
    });
    await db.session.create({
      data: {
        userId: user.id,
        tokenHash: "h",
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    const r = await reportContent(db, {
      targetType: "user",
      targetId: user.id,
      reason: "spam",
    });
    expect(r.ok).toBe(true);

    const audit = new InMemoryAuditRecorder();
    await blockUser(db, audit, {
      supportUserId: "support-1",
      userId: user.id,
      reason: "spam confirmado",
    });
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: user.id } })).blockedAt,
    ).not.toBeNull();
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(audit.entries[0]?.action).toBe("user.blocked");
  });
});
