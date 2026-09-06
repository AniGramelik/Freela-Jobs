import type { AvailabilityShift, PrismaClient } from "@prisma/client";

import {
  availableNowExpiry,
  isAvailableNow,
  isValidShift,
  isValidWeekday,
} from "@/domain/availability";
import { err, ok, type Result } from "@/domain/index";

export type WindowInput = { weekday: number; shift: string };

/** Substitui o conjunto de janelas recorrentes. Só o dono chama (rota valida). */
export async function setAvailabilityWindows(
  db: PrismaClient,
  params: { professionalProfileId: string; windows: WindowInput[] },
): Promise<Result<{ count: number }, "invalid">> {
  const clean: { weekday: number; shift: AvailabilityShift }[] = [];
  for (const w of params.windows) {
    if (!isValidWeekday(w.weekday) || !isValidShift(w.shift)) return err("invalid");
    clean.push({ weekday: w.weekday, shift: w.shift });
  }
  const deduped = [
    ...new Map(clean.map((w) => [`${w.weekday}:${w.shift}`, w])).values(),
  ];

  await db.$transaction([
    db.availabilityWindow.deleteMany({
      where: { professionalProfileId: params.professionalProfileId },
    }),
    db.availabilityWindow.createMany({
      data: deduped.map((w) => ({
        professionalProfileId: params.professionalProfileId,
        weekday: w.weekday,
        shift: w.shift,
      })),
    }),
  ]);
  return ok({ count: deduped.length });
}

export async function setAvailableNow(
  db: PrismaClient,
  params: { professionalProfileId: string; on: boolean; now?: Date },
): Promise<void> {
  const now = params.now ?? new Date();
  await db.professionalProfile.update({
    where: { id: params.professionalProfileId },
    data: { availableNowUntil: params.on ? availableNowExpiry(now) : null },
  });
}

export async function getAvailability(
  db: PrismaClient,
  params: { professionalProfileId: string; now?: Date },
) {
  const now = params.now ?? new Date();
  const [profile, windows] = await Promise.all([
    db.professionalProfile.findUnique({
      where: { id: params.professionalProfileId },
      select: { availableNowUntil: true },
    }),
    db.availabilityWindow.findMany({
      where: { professionalProfileId: params.professionalProfileId },
      orderBy: [{ weekday: "asc" }, { shift: "asc" }],
    }),
  ]);
  return {
    windows,
    availableNow: isAvailableNow(profile?.availableNowUntil ?? null, now),
    availableNowUntil: profile?.availableNowUntil ?? null,
  };
}

/** A empresa só vê disponibilidade de quem tem vínculo ATIVO (Etapa 1). */
export async function canCompanySeeAvailability(
  db: PrismaClient,
  params: { companyId: string; professionalProfileId: string },
): Promise<boolean> {
  const rel = await db.workRelationship.findUnique({
    where: {
      companyId_professionalProfileId: {
        companyId: params.companyId,
        professionalProfileId: params.professionalProfileId,
      },
    },
    select: { state: true },
  });
  return rel?.state === "ACTIVE";
}
