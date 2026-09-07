import type { PrismaClient } from "@prisma/client";

import {
  checkSendableBody,
  hasUnread,
  otherSide,
  previewOf,
  type ChatSenderSide,
} from "@/domain/chat";
import { err, ok, type Result } from "@/domain/index";

import { recordConsent, revokeConsent } from "./consent";
import { enqueueOutbox } from "./outbox";

/**
 * Mensageria empresa ↔ profissional (ADR-0009). Uma conversa por par
 * (empresa, perfil); a vaga/convocação de origem é metadado.
 */

const PHONE_CONSENT_TYPE = "conversation_phone_reveal";
const PHONE_CONSENT_VERSION = "chat-phone-v1";

type Side = ChatSenderSide;

function contextLabelOf(c: {
  jobPostingId: string | null;
  callOutId: string | null;
}): string | null {
  if (c.jobPostingId) return "Sobre uma vaga do mural";
  if (c.callOutId) return "Sobre uma convocação";
  return null;
}

// --- Autorização ------------------------------------------------------------

/**
 * A empresa só pode abrir conversa com um profissional com quem já tem laço
 * (vínculo, candidatura a uma vaga sua, resposta a uma convocação sua) ou que
 * tenha se colocado na rede pública.
 */
export async function canCompanyMessageProfessional(
  db: PrismaClient,
  params: { companyId: string; professionalProfileId: string },
): Promise<boolean> {
  const { companyId, professionalProfileId } = params;
  const [rel, application, response, listing] = await Promise.all([
    db.workRelationship.count({
      where: { companyId, professionalProfileId },
    }),
    db.application.count({
      where: { professionalProfileId, jobPosting: { companyId } },
    }),
    db.callOutResponse.count({
      where: { professionalProfileId, callOut: { companyId } },
    }),
    db.publicListing.count({
      where: { professionalProfileId, active: true },
    }),
  ]);
  return rel + application + response + listing > 0;
}

async function resolveViewerSide(
  db: PrismaClient,
  conversation: { companyId: string; professionalProfileId: string },
  viewerUserId: string,
): Promise<Side | null> {
  const [membership, ownedProfile] = await Promise.all([
    db.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: viewerUserId,
          companyId: conversation.companyId,
        },
      },
      select: { id: true },
    }),
    db.professionalProfile.findFirst({
      where: {
        id: conversation.professionalProfileId,
        ownerUserId: viewerUserId,
      },
      select: { id: true },
    }),
  ]);
  if (ownedProfile) return "PROFESSIONAL";
  if (membership) return "COMPANY";
  return null;
}

// --- Iniciar / listar / ler ----------------------------------------------------

export async function startConversation(
  db: PrismaClient,
  params: {
    companyId: string;
    professionalProfileId: string;
    openerSide: Side;
    openerUserId: string;
    jobPostingId?: string | null;
    callOutId?: string | null;
  },
): Promise<Result<{ conversationId: string; created: boolean }, "not_authorized">> {
  const {
    companyId,
    professionalProfileId,
    openerSide,
    openerUserId,
    jobPostingId,
    callOutId,
  } = params;

  if (openerSide === "COMPANY") {
    const member = await db.companyMembership.findUnique({
      where: { userId_companyId: { userId: openerUserId, companyId } },
      select: { id: true },
    });
    if (!member) return err("not_authorized");
    const allowed = await canCompanyMessageProfessional(db, {
      companyId,
      professionalProfileId,
    });
    if (!allowed) return err("not_authorized");
  } else {
    const owned = await db.professionalProfile.findFirst({
      where: { id: professionalProfileId, ownerUserId: openerUserId },
      select: { id: true },
    });
    if (!owned) return err("not_authorized");
  }

  const existing = await db.conversation.findUnique({
    where: {
      companyId_professionalProfileId: { companyId, professionalProfileId },
    },
    select: { id: true },
  });

  if (existing) {
    if (jobPostingId || callOutId) {
      await db.conversation.update({
        where: { id: existing.id },
        data: {
          jobPostingId: jobPostingId ?? undefined,
          callOutId: callOutId ?? undefined,
          state: "ACTIVE",
        },
      });
    }
    return ok({ conversationId: existing.id, created: false });
  }

  const created = await db.conversation.create({
    data: {
      companyId,
      professionalProfileId,
      jobPostingId: jobPostingId ?? null,
      callOutId: callOutId ?? null,
    },
    select: { id: true },
  });
  return ok({ conversationId: created.id, created: true });
}

export type ConversationListItem = {
  id: string;
  counterpartName: string;
  preview: string;
  lastMessageAt: Date;
  hasUnread: boolean;
  contextLabel: string | null;
};

export async function listConversations(
  db: PrismaClient,
  params:
    | { side: "COMPANY"; companyId: string }
    | { side: "PROFESSIONAL"; professionalProfileId: string },
): Promise<ConversationListItem[]> {
  const where =
    params.side === "COMPANY"
      ? { companyId: params.companyId }
      : { professionalProfileId: params.professionalProfileId };

  const rows = await db.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    include: {
      company: { select: { name: true } },
      professionalProfile: { select: { fullName: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    counterpartName:
      params.side === "COMPANY"
        ? c.professionalProfile.fullName
        : c.company.name,
    preview: c.messages[0]
      ? previewOf(c.messages[0].body)
      : "Sem mensagens ainda",
    lastMessageAt: c.lastMessageAt,
    hasUnread: hasUnread(
      c.lastMessageAt,
      params.side === "COMPANY"
        ? c.companyLastReadAt
        : c.professionalLastReadAt,
    ),
    contextLabel: contextLabelOf(c),
  }));
}

export async function countUnreadConversations(
  db: PrismaClient,
  params:
    | { side: "COMPANY"; companyId: string }
    | { side: "PROFESSIONAL"; professionalProfileId: string },
): Promise<number> {
  const items = await listConversations(db, params);
  return items.filter((i) => i.hasUnread).length;
}

export type ConversationView = {
  id: string;
  side: Side;
  state: "ACTIVE" | "ARCHIVED";
  counterpartName: string;
  counterpartEmail: string | null;
  counterpartPhone: string | null;
  ownPhone: string | null;
  phoneRevealedAt: Date | null;
  canRevealPhone: boolean;
  contextLabel: string | null;
  messages: {
    id: string;
    side: Side;
    body: string;
    createdAt: Date;
    mine: boolean;
  }[];
};

export async function getConversation(
  db: PrismaClient,
  params: { conversationId: string; viewerUserId: string },
): Promise<Result<ConversationView, "not_found" | "not_authorized">> {
  const c = await db.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      company: { select: { name: true } },
      professionalProfile: {
        select: { fullName: true, email: true, phoneE164: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!c) return err("not_found");

  const side = await resolveViewerSide(db, c, params.viewerUserId);
  if (!side) return err("not_authorized");

  const phoneRevealed = c.phoneRevealedAt != null;

  return ok({
    id: c.id,
    side,
    state: c.state,
    counterpartName:
      side === "COMPANY" ? c.professionalProfile.fullName : c.company.name,
    counterpartEmail: side === "COMPANY" ? c.professionalProfile.email : null,
    counterpartPhone:
      side === "COMPANY" && phoneRevealed
        ? c.professionalProfile.phoneE164
        : null,
    ownPhone: side === "PROFESSIONAL" ? c.professionalProfile.phoneE164 : null,
    phoneRevealedAt: c.phoneRevealedAt,
    canRevealPhone: side === "PROFESSIONAL",
    contextLabel: contextLabelOf(c),
    messages: c.messages.map((m) => ({
      id: m.id,
      side: m.senderSide,
      body: m.body,
      createdAt: m.createdAt,
      mine: m.senderSide === side,
    })),
  });
}

// --- Enviar / marcar lido ----------------------------------------------------

export async function sendMessage(
  db: PrismaClient,
  params: { conversationId: string; senderUserId: string; body: string },
): Promise<
  Result<
    { messageId: string },
    "not_found" | "not_authorized" | "empty" | "too_long" | "archived"
  >
> {
  const c = await db.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      company: { select: { name: true } },
      professionalProfile: {
        select: { fullName: true, email: true, id: true },
      },
    },
  });
  if (!c) return err("not_found");
  if (c.state === "ARCHIVED") return err("archived");

  const side = await resolveViewerSide(db, c, params.senderUserId);
  if (!side) return err("not_authorized");

  const check = checkSendableBody(params.body);
  if (!check.ok) return err(check.reason);

  const now = new Date();
  const recipientSide = otherSide(side);
  const senderName =
    side === "COMPANY" ? c.company.name : c.professionalProfile.fullName;

  const message = await db.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: {
        conversationId: c.id,
        senderSide: side,
        senderUserId: params.senderUserId,
        body: check.body,
      },
      select: { id: true },
    });
    await tx.conversation.update({
      where: { id: c.id },
      data: {
        lastMessageAt: now,
        state: "ACTIVE",
        ...(side === "COMPANY"
          ? { companyLastReadAt: now }
          : { professionalLastReadAt: now }),
      },
    });
    await enqueueOutbox(tx, {
      topic: "notification",
      dedupeKey: `chat-message:${created.id}`,
      payload: {
        subjectId:
          recipientSide === "PROFESSIONAL"
            ? c.professionalProfileId
            : undefined,
        notifications: [
          {
            recipient:
              recipientSide === "PROFESSIONAL"
                ? (c.professionalProfile.email ??
                  `profile:${c.professionalProfileId}`)
                : `company:${c.companyId}`,
            channel: "EMAIL",
            category: "chat_message",
            template: "chat_message",
            data: {
              conversationId: c.id,
              fromName: senderName,
              preview: previewOf(check.body),
            },
          },
        ],
      },
    });
    return created;
  });

  return ok({ messageId: message.id });
}

export async function markConversationRead(
  db: PrismaClient,
  params: { conversationId: string; viewerUserId: string },
): Promise<Result<void, "not_found" | "not_authorized">> {
  const c = await db.conversation.findUnique({
    where: { id: params.conversationId },
    select: { id: true, companyId: true, professionalProfileId: true },
  });
  if (!c) return err("not_found");
  const side = await resolveViewerSide(db, c, params.viewerUserId);
  if (!side) return err("not_authorized");

  await db.conversation.update({
    where: { id: c.id },
    data:
      side === "COMPANY"
        ? { companyLastReadAt: new Date() }
        : { professionalLastReadAt: new Date() },
  });
  return ok(undefined);
}

// --- Liberar / ocultar telefone --------------------------------------------

async function assertProfessionalOwner(
  db: PrismaClient,
  conversationId: string,
  professionalUserId: string,
): Promise<
  Result<{ id: string; professionalProfileId: string }, "not_found" | "not_authorized">
> {
  const c = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, professionalProfileId: true },
  });
  if (!c) return err("not_found");
  const owned = await db.professionalProfile.findFirst({
    where: { id: c.professionalProfileId, ownerUserId: professionalUserId },
    select: { id: true },
  });
  if (!owned) return err("not_authorized");
  return ok(c);
}

export async function revealPhoneInConversation(
  db: PrismaClient,
  params: { conversationId: string; professionalUserId: string },
): Promise<Result<void, "not_found" | "not_authorized">> {
  const guard = await assertProfessionalOwner(
    db,
    params.conversationId,
    params.professionalUserId,
  );
  if (!guard.ok) return guard;

  await db.conversation.update({
    where: { id: guard.value.id },
    data: { phoneRevealedAt: new Date() },
  });
  await recordConsent(db, {
    subjectType: "professional_profile",
    subjectId: guard.value.professionalProfileId,
    type: PHONE_CONSENT_TYPE,
    textVersion: PHONE_CONSENT_VERSION,
    origin: "chat",
  });
  return ok(undefined);
}

export async function hidePhoneInConversation(
  db: PrismaClient,
  params: { conversationId: string; professionalUserId: string },
): Promise<Result<void, "not_found" | "not_authorized">> {
  const guard = await assertProfessionalOwner(
    db,
    params.conversationId,
    params.professionalUserId,
  );
  if (!guard.ok) return guard;

  await db.conversation.update({
    where: { id: guard.value.id },
    data: { phoneRevealedAt: null },
  });
  await revokeConsent(db, {
    subjectType: "professional_profile",
    subjectId: guard.value.professionalProfileId,
    type: PHONE_CONSENT_TYPE,
    textVersion: PHONE_CONSENT_VERSION,
  });
  return ok(undefined);
}
