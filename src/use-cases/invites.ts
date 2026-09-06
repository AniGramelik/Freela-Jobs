import type { PrismaClient } from "@prisma/client";

import { inviteExpiry, isInviteUsable } from "@/domain/invite";
import { err, ok, type Result } from "@/domain/index";
import { generateToken, hashToken } from "@/lib/tokens";

import { enqueueOutbox } from "./outbox";

export type SendInviteError = "not_found" | "already_claimed" | "no_email";

export async function sendInvite(
  db: PrismaClient,
  params: {
    companyId: string;
    professionalProfileId: string;
    now?: Date;
  },
): Promise<Result<{ inviteId: string; token: string }, SendInviteError>> {
  const now = params.now ?? new Date();

  const relationship = await db.workRelationship.findUnique({
    where: {
      companyId_professionalProfileId: {
        companyId: params.companyId,
        professionalProfileId: params.professionalProfileId,
      },
    },
    include: { professionalProfile: true },
  });
  if (!relationship) return err("not_found");

  const profile = relationship.professionalProfile;
  if (profile.state === "CLAIMED") return err("already_claimed");
  const email = profile.email;
  if (!email) return err("no_email");

  const token = generateToken();

  const invite = await db.$transaction(async (tx) => {
    await tx.invite.updateMany({
      where: { professionalProfileId: profile.id, state: "PENDING" },
      data: { state: "EXPIRED" },
    });
    const created = await tx.invite.create({
      data: {
        professionalProfileId: profile.id,
        companyId: params.companyId,
        tokenHash: hashToken(token),
        channel: "email",
        expiresAt: inviteExpiry(now),
      },
    });
    await tx.professionalProfile.update({
      where: { id: profile.id },
      data: {
        state: "INVITED",
        firstContactedAt: profile.firstContactedAt ?? now,
      },
    });
    await enqueueOutbox(tx, {
      topic: "notification",
      dedupeKey: `invite:${created.id}`,
      payload: {
        subjectId: profile.id,
        notifications: [
          {
            recipient: email,
            channel: "EMAIL",
            category: "invite",
            template: "claim_invite",
            data: { token, professionalName: profile.fullName },
          },
        ],
      },
    });
    return created;
  });

  return ok({ inviteId: invite.id, token });
}

export async function resendInvite(
  db: PrismaClient,
  params: { companyId: string; inviteId: string; now?: Date },
): Promise<Result<{ inviteId: string; token: string }, SendInviteError>> {
  const invite = await db.invite.findUnique({ where: { id: params.inviteId } });
  if (!invite || invite.companyId !== params.companyId) return err("not_found");
  return sendInvite(db, {
    companyId: params.companyId,
    professionalProfileId: invite.professionalProfileId,
    now: params.now,
  });
}

export async function revokeInvite(
  db: PrismaClient,
  params: { companyId: string; inviteId: string },
): Promise<Result<{ inviteId: string }, "not_found">> {
  const invite = await db.invite.findUnique({ where: { id: params.inviteId } });
  if (!invite || invite.companyId !== params.companyId) return err("not_found");

  await db.$transaction(async (tx) => {
    await tx.invite.update({
      where: { id: invite.id },
      data: { state: "REVOKED" },
    });
    const stillPending = await tx.invite.count({
      where: { professionalProfileId: invite.professionalProfileId, state: "PENDING" },
    });
    if (stillPending === 0) {
      await tx.professionalProfile.updateMany({
        where: { id: invite.professionalProfileId, state: "INVITED" },
        data: { state: "MANAGED" },
      });
    }
  });
  return ok({ inviteId: invite.id });
}

export async function getUsableInvite(
  db: PrismaClient,
  params: { token: string; now?: Date },
) {
  const now = params.now ?? new Date();
  const invite = await db.invite.findUnique({
    where: { tokenHash: hashToken(params.token) },
    include: { professionalProfile: true },
  });
  if (!invite || !isInviteUsable(invite.state, invite.expiresAt, now)) {
    return null;
  }
  return invite;
}
