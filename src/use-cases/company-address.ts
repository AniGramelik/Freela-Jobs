import type { CompanyAddress, PrismaClient } from "@prisma/client";

import { isWithinPilot } from "@/domain/pilot";
import { err, ok, type Result } from "@/domain/index";

import type { Geocoder } from "./geocoding";

export type SetCompanyAddressInput = {
  companyId: string;
  line: string;
  district?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  radiusKm?: number;
  pilotGateEnabled: boolean;
};

export type SetCompanyAddressError = "invalid" | "outside_pilot";

export async function setCompanyAddress(
  db: PrismaClient,
  geocoder: Geocoder,
  input: SetCompanyAddressInput,
): Promise<Result<{ geocoded: boolean }, SetCompanyAddressError>> {
  const line = input.line.trim();
  const city = input.city.trim();
  const state = input.state.trim().toUpperCase();

  if (!line || !city || state.length !== 2) return err("invalid");
  if (!isWithinPilot(city, state, input.pilotGateEnabled)) {
    return err("outside_pilot");
  }

  const radiusKm = input.radiusKm && input.radiusKm > 0 ? input.radiusKm : 20;
  const query = [line, input.district, `${city} - ${state}`, input.zip]
    .filter(Boolean)
    .join(", ");

  const point = await geocoder.geocode(query).catch(() => null);

  await db.companyAddress.upsert({
    where: { companyId: input.companyId },
    create: {
      companyId: input.companyId,
      line,
      district: input.district?.trim() || null,
      city,
      state,
      zip: input.zip?.trim() || null,
      radiusKm,
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
      geocodeStatus: point ? "OK" : "FAILED",
      geocodedAt: point ? new Date() : null,
    },
    update: {
      line,
      district: input.district?.trim() || null,
      city,
      state,
      zip: input.zip?.trim() || null,
      radiusKm,
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
      geocodeStatus: point ? "OK" : "FAILED",
      geocodedAt: point ? new Date() : null,
    },
  });

  return ok({ geocoded: point !== null });
}

export function getCompanyAddress(
  db: PrismaClient,
  companyId: string,
): Promise<CompanyAddress | null> {
  return db.companyAddress.findUnique({ where: { companyId } });
}
