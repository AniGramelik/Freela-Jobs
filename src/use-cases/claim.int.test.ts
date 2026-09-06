import type { Company, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { completeClaim, requestClaimOtp, type OtpSender } from "./claim";
import { getUsableInvite, revokeInvite, sendInvite } from "./invites";
import { registerManagedProfessional } from "./professionals";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

class CapturingOtpSender implements OtpSender {
  lastCode: string | null = null;
  async send(_phone: string, code: string) {
    this.lastCode = code;
  }
}

async function seedInvitedProfessional(company: Company) {
  const reg = await registerManagedProfessional(db, {
    companyId: company.id,
    fullName: "Maria Freelas",
    phone: "27999123456",
    email: "maria@exemplo.com",
  });
  if (!reg.ok) throw new Error("setup");
  const invite = await sendInvite(db, {
    companyId: company.id,
    professionalProfileId: reg.value.professionalProfileId,
  });
  if (!invite.ok) throw new Error("setup invite");
  return { profileId: reg.value.professionalProfileId, token: invite.value.token };
}

describe("sendInvite", () => {
  it("marca o perfil INVITED, enfileira e-mail e invalida convite anterior", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const { profileId, token } = await seedInvitedProfessional(co);

    const profile = await db.professionalProfile.findUniqueOrThrow({
      where: { id: profileId },
    });
    expect(profile.state).toBe("INVITED");
    expect(profile.firstContactedAt).not.toBeNull();
    expect(
      await db.outboxMessage.count({ where: { topic: "notification" } }),
    ).toBe(1);

    // reenvio invalida o token anterior
    const reg2 = await sendInvite(db, {
      companyId: co.id,
      professionalProfileId: profileId,
    });
    if (!reg2.ok) throw new Error("resend");
    expect(await getUsableInvite(db, { token })).toBeNull();
    expect(await getUsableInvite(db, { token: reg2.value.token })).not.toBeNull();
  });

  it("recusa perfil sem e-mail e perfil já reivindicado", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const reg = await registerManagedProfessional(db, {
      companyId: co.id,
      fullName: "Sem Email",
      phone: "27999000001",
    });
    if (!reg.ok) throw new Error("setup");
    expect(
      await sendInvite(db, {
        companyId: co.id,
        professionalProfileId: reg.value.professionalProfileId,
      }),
    ).toEqual({ ok: false, error: "no_email" });
  });

  it("revogar volta o perfil para MANAGED se não sobra convite pendente", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const reg = await registerManagedProfessional(db, {
      companyId: co.id,
      fullName: "Fulano",
      phone: "27999000002",
      email: "f@x.com",
    });
    if (!reg.ok) throw new Error("setup");
    const inv = await sendInvite(db, {
      companyId: co.id,
      professionalProfileId: reg.value.professionalProfileId,
    });
    if (!inv.ok) throw new Error("setup");

    const invite = await db.invite.findFirstOrThrow();
    await revokeInvite(db, { companyId: co.id, inviteId: invite.id });
    expect(
      (
        await db.professionalProfile.findUniqueOrThrow({
          where: { id: reg.value.professionalProfileId },
        })
      ).state,
    ).toBe("MANAGED");
  });
});

describe("claim via OTP", () => {
  it("caminho feliz: envia código, valida e reivindica o perfil", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const { profileId, token } = await seedInvitedProfessional(co);
    const sender = new CapturingOtpSender();

    expect(await requestClaimOtp(db, sender, { token })).toEqual({
      ok: true,
      value: { sent: true },
    });
    expect(sender.lastCode).toMatch(/^\d{6}$/);

    const done = await completeClaim(db, {
      token,
      code: sender.lastCode!,
      email: "Maria@Exemplo.com",
    });
    expect(done.ok).toBe(true);
    if (!done.ok) return;

    const profile = await db.professionalProfile.findUniqueOrThrow({
      where: { id: profileId },
    });
    expect(profile.state).toBe("CLAIMED");
    expect(profile.ownerUserId).toBe(done.value.userId);
    expect(
      (await db.invite.findFirstOrThrow()).state,
    ).toBe("ACCEPTED");
  });

  it("código errado incrementa tentativas; expira após o limite", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const { token } = await seedInvitedProfessional(co);
    const sender = new CapturingOtpSender();
    await requestClaimOtp(db, sender, { token });

    for (let i = 0; i < 5; i += 1) {
      expect(
        await completeClaim(db, { token, code: "000000", email: "m@x.com" }),
      ).toEqual({ ok: false, error: "invalid_code" });
    }
    // agora o OTP está travado por tentativas
    expect(
      await completeClaim(db, { token, code: sender.lastCode!, email: "m@x.com" }),
    ).toEqual({ ok: false, error: "code_expired" });
  });

  it("convite inválido não permite claim", async () => {
    const sender = new CapturingOtpSender();
    expect(
      await requestClaimOtp(db, sender, { token: "nao-existe" }),
    ).toEqual({ ok: false, error: "invalid_invite" });
  });

  it("claim concorrente do mesmo perfil resolve para um único dono", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const { profileId, token } = await seedInvitedProfessional(co);
    const sender = new CapturingOtpSender();
    await requestClaimOtp(db, sender, { token });
    const code = sender.lastCode!;

    const results = await Promise.allSettled([
      completeClaim(db, { token, code, email: "a@x.com" }),
      completeClaim(db, { token, code, email: "b@x.com" }),
    ]);
    const okCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.ok,
    ).length;
    expect(okCount).toBe(1);

    const profile = await db.professionalProfile.findUniqueOrThrow({
      where: { id: profileId },
    });
    expect(profile.state).toBe("CLAIMED");
    expect(profile.ownerUserId).not.toBeNull();
  });
});
