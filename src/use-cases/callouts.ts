import type { CallOut, PrismaClient } from "@prisma/client";

import { isAvailableNow } from "@/domain/availability";
import {
  callOutStatusAfterAccept,
  canPublishCallOut,
  canRespond,
} from "@/domain/callout";
import { isWithinRadius } from "@/domain/geo";
import { err, ok, type Result } from "@/domain/index";

import { enqueueOutbox } from "./outbox";

export type CreateCallOutInput = {
  companyId: string;
  mode: "TARGETED" | "OPEN";
  role: string;
  shiftDate: Date;
  shiftStart: string;
  shiftEnd?: string | null;
  location: string;
  compensationText?: string | null;
  notes?: string | null;
  quantity?: number;
  radiusKm?: number | null;
  targetProfileIds?: string[];
};

export async function createCallOut(
  db: PrismaClient,
  input: CreateCallOutInput,
): Promise<Result<{ callOutId: string }, "invalid" | "targets_not_linked">> {
  if (!input.role.trim() || !input.location.trim()) return err("invalid");
  if (Number.isNaN(input.shiftDate.getTime())) return err("invalid");

  const quantity = input.quantity && input.quantity > 0 ? input.quantity : 1;
  const targets = input.mode === "TARGETED" ? (input.targetProfileIds ?? []) : [];

  if (input.mode === "TARGETED") {
    if (targets.length === 0) return err("invalid");
    const linked = await db.workRelationship.count({
      where: {
        companyId: input.companyId,
        professionalProfileId: { in: targets },
        state: "ACTIVE",
      },
    });
    if (linked !== new Set(targets).size) return err("targets_not_linked");
  }

  const callout = await db.$transaction(async (tx) => {
    const created = await tx.callOut.create({
      data: {
        companyId: input.companyId,
        mode: input.mode,
        role: input.role.trim(),
        shiftDate: input.shiftDate,
        shiftStart: input.shiftStart,
        shiftEnd: input.shiftEnd ?? null,
        location: input.location.trim(),
        compensationText: input.compensationText ?? null,
        notes: input.notes ?? null,
        quantity,
        radiusKm: input.mode === "OPEN" ? (input.radiusKm ?? 20) : null,
      },
    });
    if (targets.length > 0) {
      await tx.callOutResponse.createMany({
        data: [...new Set(targets)].map((professionalProfileId) => ({
          callOutId: created.id,
          professionalProfileId,
        })),
      });
    }
    return created;
  });

  return ok({ callOutId: callout.id });
}

type ShiftName = "MORNING" | "AFTERNOON" | "NIGHT";

function shiftFromStart(start: string): ShiftName {
  const hour = Number(start.split(":")[0] ?? "0");
  if (hour < 12) return "MORNING";
  if (hour < 18) return "AFTERNOON";
  return "NIGHT";
}

/**
 * Publica a convocação. Para OPEN, faz o fan-out: cria `OFFERED` para os
 * elegíveis (vínculo ACTIVE + função + raio quando há coordenadas). Enfileira
 * a notificação de todos os destinatários.
 */
export async function publishCallOut(
  db: PrismaClient,
  params: { companyId: string; callOutId: string; now?: Date },
): Promise<
  Result<{ recipients: number }, "not_found" | "not_draft" | "no_quantity" | "shift_past">
> {
  const now = params.now ?? new Date();
  const callout = await db.callOut.findUnique({
    where: { id: params.callOutId },
  });
  if (!callout || callout.companyId !== params.companyId) return err("not_found");

  const check = canPublishCallOut(callout, now);
  if (!check.ok) return err(check.error);

  if (callout.mode === "OPEN") {
    await addOpenRecipients(db, callout, now);
  }

  await db.callOut.update({
    where: { id: callout.id },
    data: { status: "OPEN", publishedAt: now },
  });

  const recipients = await db.callOutResponse.findMany({
    where: { callOutId: callout.id, state: "OFFERED" },
    include: { professionalProfile: { select: { email: true, phoneE164: true } } },
  });

  if (recipients.length > 0) {
    await enqueueOutbox(db, {
      topic: "notification",
      dedupeKey: `callout:${callout.id}`,
      payload: {
        notifications: recipients.flatMap((r) => {
          const to = r.professionalProfile.email ?? r.professionalProfile.phoneE164;
          return [
            {
              recipient: to,
              channel: "EMAIL" as const,
              category: "callout",
              template: "callout_new",
              data: { callOutId: callout.id, role: callout.role },
            },
          ];
        }),
      },
    });
  }

  return ok({ recipients: recipients.length });
}

async function addOpenRecipients(
  db: PrismaClient,
  callout: CallOut,
  now: Date,
): Promise<void> {
  const [address, relationships] = await Promise.all([
    db.companyAddress.findUnique({ where: { companyId: callout.companyId } }),
    db.workRelationship.findMany({
      where: {
        companyId: callout.companyId,
        state: "ACTIVE",
        roles: { has: callout.role },
      },
      include: {
        professionalProfile: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            availableNowUntil: true,
            availabilityWindows: { select: { weekday: true, shift: true } },
          },
        },
      },
    }),
  ]);

  const center =
    address?.latitude != null && address.longitude != null
      ? { latitude: address.latitude, longitude: address.longitude }
      : null;
  const shift = shiftFromStart(callout.shiftStart);
  const weekday = callout.shiftDate.getUTCDay();

  const eligible = relationships.filter((rel) => {
    const p = rel.professionalProfile;
    if (
      center &&
      callout.radiusKm != null &&
      p.latitude != null &&
      p.longitude != null &&
      !isWithinRadius(
        center,
        { latitude: p.latitude, longitude: p.longitude },
        callout.radiusKm,
      )
    ) {
      return false;
    }
    return true;
  });

  // Disponibilidade é filtro suave: ordena os disponíveis primeiro, não exclui.
  const ranked = [...eligible].sort((a, b) => {
    const score = (rel: (typeof eligible)[number]) => {
      const p = rel.professionalProfile;
      const now2 = isAvailableNow(p.availableNowUntil, now) ? 2 : 0;
      const win = p.availabilityWindows.some(
        (w) => w.weekday === weekday && w.shift === shift,
      )
        ? 1
        : 0;
      return now2 + win;
    };
    return score(b) - score(a);
  });

  await db.callOutResponse.createMany({
    data: ranked.map((rel) => ({
      callOutId: callout.id,
      professionalProfileId: rel.professionalProfile.id,
    })),
    skipDuplicates: true,
  });
}

export async function respondToCallOut(
  db: PrismaClient,
  params: {
    callOutId: string;
    professionalProfileId: string;
    action: "accept" | "decline" | "withdraw";
    now?: Date;
  },
): Promise<
  Result<
    { state: string },
    "not_found" | "not_open" | "invalid_transition" | "full"
  >
> {
  const now = params.now ?? new Date();

  return db.$transaction(async (tx) => {
    const callout = await tx.callOut.findUnique({
      where: { id: params.callOutId },
    });
    const response = await tx.callOutResponse.findUnique({
      where: {
        callOutId_professionalProfileId: {
          callOutId: params.callOutId,
          professionalProfileId: params.professionalProfileId,
        },
      },
    });
    if (!callout || !response) return err("not_found" as const);
    if (callout.status !== "OPEN" && callout.status !== "FILLED") {
      return err("not_open" as const);
    }
    if (!canRespond(response.state, params.action)) {
      return err("invalid_transition" as const);
    }

    if (params.action === "accept") {
      const accepted = await tx.callOutResponse.count({
        where: { callOutId: callout.id, state: "ACCEPTED" },
      });
      if (accepted >= callout.quantity) return err("full" as const);

      await tx.callOutResponse.update({
        where: { id: response.id },
        data: { state: "ACCEPTED", respondedAt: now },
      });
      const nextStatus = callOutStatusAfterAccept(accepted + 1, callout.quantity);
      if (nextStatus !== callout.status) {
        await tx.callOut.update({
          where: { id: callout.id },
          data: { status: nextStatus },
        });
      }
      return ok({ state: "ACCEPTED" });
    }

    const newState = params.action === "decline" ? "DECLINED" : "WITHDRAWN";
    await tx.callOutResponse.update({
      where: { id: response.id },
      data: { state: newState, respondedAt: now },
    });
    if (params.action === "withdraw" && callout.status === "FILLED") {
      await tx.callOut.update({
        where: { id: callout.id },
        data: { status: "OPEN" },
      });
    }
    return ok({ state: newState });
  });
}

export async function cancelCallOut(
  db: PrismaClient,
  params: { companyId: string; callOutId: string },
): Promise<Result<{ callOutId: string }, "not_found">> {
  const callout = await db.callOut.findUnique({
    where: { id: params.callOutId },
  });
  if (!callout || callout.companyId !== params.companyId) return err("not_found");
  await db.callOut.update({
    where: { id: callout.id },
    data: { status: "CANCELLED" },
  });
  return ok({ callOutId: callout.id });
}

export function listCompanyCallOuts(db: PrismaClient, companyId: string) {
  return db.callOut.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      responses: {
        include: {
          professionalProfile: { select: { fullName: true, phoneE164: true } },
        },
      },
    },
  });
}
