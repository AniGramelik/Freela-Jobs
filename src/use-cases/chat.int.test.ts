import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  canCompanyMessageProfessional,
  getConversation,
  hidePhoneInConversation,
  listConversations,
  markConversationRead,
  revealPhoneInConversation,
  sendMessage,
  startConversation,
} from "./chat";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

let phoneSeq = 0;
async function scene(opts: { withRelationship?: boolean } = {}) {
  const company = await db.company.create({ data: { name: "Bar do Cais" } });
  const companyUser = await db.user.create({
    data: { email: `dona-${phoneSeq}@x.com`, emailVerifiedAt: new Date() },
  });
  await db.companyMembership.create({
    data: { userId: companyUser.id, companyId: company.id, role: "OWNER" },
  });

  const profUser = await db.user.create({
    data: { email: `prof-${phoneSeq}@x.com`, emailVerifiedAt: new Date() },
  });
  phoneSeq += 1;
  const profile = await db.professionalProfile.create({
    data: {
      fullName: "Ana Beatriz",
      phoneE164: `+552799912${String(1000 + phoneSeq).padStart(4, "0")}`,
      email: profUser.email,
      createdByCompanyId: company.id,
      state: "CLAIMED",
      ownerUserId: profUser.id,
    },
  });
  if (opts.withRelationship ?? true) {
    await db.workRelationship.create({
      data: {
        companyId: company.id,
        professionalProfileId: profile.id,
        state: "ACTIVE",
      },
    });
  }
  return { company, companyUser, profUser, profile };
}

describe("iniciar conversa", () => {
  it("empresa com vínculo abre; sem laço nenhum é barrada", async () => {
    const { company, companyUser, profile } = await scene();
    const ok = await startConversation(db, {
      companyId: company.id,
      professionalProfileId: profile.id,
      openerSide: "COMPANY",
      openerUserId: companyUser.id,
    });
    expect(ok.ok).toBe(true);

    const stranger = await db.company.create({ data: { name: "Outra" } });
    const strangerUser = await db.user.create({
      data: { email: "outra@x.com" },
    });
    await db.companyMembership.create({
      data: { userId: strangerUser.id, companyId: stranger.id, role: "OWNER" },
    });
    const blocked = await startConversation(db, {
      companyId: stranger.id,
      professionalProfileId: profile.id,
      openerSide: "COMPANY",
      openerUserId: strangerUser.id,
    });
    expect(blocked).toEqual({ ok: false, error: "not_authorized" });
  });

  it("laço via candidatura também libera a empresa", async () => {
    const { company, companyUser, profile } = await scene({
      withRelationship: false,
    });
    expect(
      await canCompanyMessageProfessional(db, {
        companyId: company.id,
        professionalProfileId: profile.id,
      }),
    ).toBe(false);

    const job = await db.jobPosting.create({
      data: {
        companyId: company.id,
        title: "Garçom",
        description: "...",
        categorySlug: "garcom",
        vinculo: "DIARIA",
        locationMode: "PRESENCIAL",
        applicationDeadline: new Date(Date.now() + 86_400_000),
      },
    });
    await db.application.create({
      data: { jobPostingId: job.id, professionalProfileId: profile.id },
    });

    expect(
      await canCompanyMessageProfessional(db, {
        companyId: company.id,
        professionalProfileId: profile.id,
      }),
    ).toBe(true);
    const r = await startConversation(db, {
      companyId: company.id,
      professionalProfileId: profile.id,
      openerSide: "COMPANY",
      openerUserId: companyUser.id,
    });
    expect(r.ok).toBe(true);
  });

  it("é idempotente por par (empresa, profissional)", async () => {
    const { company, companyUser, profUser, profile } = await scene();
    const a = await startConversation(db, {
      companyId: company.id,
      professionalProfileId: profile.id,
      openerSide: "COMPANY",
      openerUserId: companyUser.id,
    });
    const b = await startConversation(db, {
      companyId: company.id,
      professionalProfileId: profile.id,
      openerSide: "PROFESSIONAL",
      openerUserId: profUser.id,
    });
    expect(a.ok && b.ok && a.value.conversationId === b.value.conversationId).toBe(
      true,
    );
    expect(a.ok && a.value.created).toBe(true);
    expect(b.ok && b.value.created).toBe(false);
    expect(await db.conversation.count()).toBe(1);
  });
});

describe("enviar mensagem", () => {
  async function openConversation() {
    const s = await scene();
    const r = await startConversation(db, {
      companyId: s.company.id,
      professionalProfileId: s.profile.id,
      openerSide: "COMPANY",
      openerUserId: s.companyUser.id,
    });
    if (!r.ok) throw new Error("setup");
    return { ...s, conversationId: r.value.conversationId };
  }

  it("grava, sobe lastMessageAt e enfileira notificação ao outro lado", async () => {
    const { conversationId, companyUser } = await openConversation();
    const before = await db.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    const sent = await sendMessage(db, {
      conversationId,
      senderUserId: companyUser.id,
      body: "  Oi! Consegue amanhã 18h?  ",
    });
    expect(sent.ok).toBe(true);

    const msg = await db.chatMessage.findFirstOrThrow({
      where: { conversationId },
    });
    expect(msg.body).toBe("Oi! Consegue amanhã 18h?");
    expect(msg.senderSide).toBe("COMPANY");

    const after = await db.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });
    expect(after.lastMessageAt.getTime()).toBeGreaterThan(
      before.lastMessageAt.getTime(),
    );
    expect(after.companyLastReadAt).not.toBeNull();

    expect(
      await db.outboxMessage.count({
        where: { dedupeKey: `chat-message:${msg.id}` },
      }),
    ).toBe(1);
  });

  it("rejeita vazio, gigante, forasteiro e conversa arquivada", async () => {
    const { conversationId, companyUser, profUser } = await openConversation();

    expect(
      await sendMessage(db, {
        conversationId,
        senderUserId: companyUser.id,
        body: "   ",
      }),
    ).toEqual({ ok: false, error: "empty" });

    expect(
      await sendMessage(db, {
        conversationId,
        senderUserId: companyUser.id,
        body: "a".repeat(2_001),
      }),
    ).toEqual({ ok: false, error: "too_long" });

    const outsider = await db.user.create({ data: { email: "x@x.com" } });
    expect(
      await sendMessage(db, {
        conversationId,
        senderUserId: outsider.id,
        body: "oi",
      }),
    ).toEqual({ ok: false, error: "not_authorized" });

    await db.conversation.update({
      where: { id: conversationId },
      data: { state: "ARCHIVED" },
    });
    expect(
      await sendMessage(db, {
        conversationId,
        senderUserId: profUser.id,
        body: "oi",
      }),
    ).toEqual({ ok: false, error: "archived" });
  });

  it("markConversationRead zera o não-lido do lado que leu", async () => {
    const { conversationId, companyUser, profUser, profile, company } =
      await openConversation();
    await sendMessage(db, {
      conversationId,
      senderUserId: companyUser.id,
      body: "primeira",
    });

    const beforeRead = await listConversations(db, {
      side: "PROFESSIONAL",
      professionalProfileId: profile.id,
    });
    expect(beforeRead.at(0)?.hasUnread).toBe(true);

    await markConversationRead(db, {
      conversationId,
      viewerUserId: profUser.id,
    });
    const afterRead = await listConversations(db, {
      side: "PROFESSIONAL",
      professionalProfileId: profile.id,
    });
    expect(afterRead.at(0)?.hasUnread).toBe(false);

    // a empresa ainda não leu a resposta que virá
    await sendMessage(db, {
      conversationId,
      senderUserId: profUser.id,
      body: "topo sim",
    });
    const companyView = await listConversations(db, {
      side: "COMPANY",
      companyId: company.id,
    });
    expect(companyView.at(0)?.hasUnread).toBe(true);
  });
});

describe("telefone na conversa", () => {
  it("liberar expõe o número só para a empresa e grava consentimento; ocultar revoga", async () => {
    const s = await scene();
    const started = await startConversation(db, {
      companyId: s.company.id,
      professionalProfileId: s.profile.id,
      openerSide: "PROFESSIONAL",
      openerUserId: s.profUser.id,
    });
    if (!started.ok) throw new Error("setup");
    const conversationId = started.value.conversationId;

    const hiddenView = await getConversation(db, {
      conversationId,
      viewerUserId: s.companyUser.id,
    });
    expect(hiddenView.ok && hiddenView.value.counterpartPhone).toBeNull();

    const rev = await revealPhoneInConversation(db, {
      conversationId,
      professionalUserId: s.profUser.id,
    });
    expect(rev.ok).toBe(true);

    const shownView = await getConversation(db, {
      conversationId,
      viewerUserId: s.companyUser.id,
    });
    expect(shownView.ok && shownView.value.counterpartPhone).toBe(
      s.profile.phoneE164,
    );
    expect(
      await db.consent.count({
        where: {
          subjectId: s.profile.id,
          type: "conversation_phone_reveal",
          state: "GRANTED",
        },
      }),
    ).toBe(1);

    // só o profissional pode liberar
    const notAllowed = await revealPhoneInConversation(db, {
      conversationId,
      professionalUserId: s.companyUser.id,
    });
    expect(notAllowed).toEqual({ ok: false, error: "not_authorized" });

    await hidePhoneInConversation(db, {
      conversationId,
      professionalUserId: s.profUser.id,
    });
    const hiddenAgain = await getConversation(db, {
      conversationId,
      viewerUserId: s.companyUser.id,
    });
    expect(hiddenAgain.ok && hiddenAgain.value.counterpartPhone).toBeNull();
    expect(
      await db.consent.count({
        where: {
          subjectId: s.profile.id,
          type: "conversation_phone_reveal",
          state: "REVOKED",
        },
      }),
    ).toBe(1);
  });

  it("getConversation nega quem não é das duas pontas", async () => {
    const s = await scene();
    const started = await startConversation(db, {
      companyId: s.company.id,
      professionalProfileId: s.profile.id,
      openerSide: "PROFESSIONAL",
      openerUserId: s.profUser.id,
    });
    if (!started.ok) throw new Error("setup");
    const outsider = await db.user.create({ data: { email: "z@z.com" } });
    expect(
      await getConversation(db, {
        conversationId: started.value.conversationId,
        viewerUserId: outsider.id,
      }),
    ).toEqual({ ok: false, error: "not_authorized" });
  });
});
