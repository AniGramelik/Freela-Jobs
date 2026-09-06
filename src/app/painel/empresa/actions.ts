"use server";

import { redirect } from "next/navigation";

import { pilotGateEnabled } from "@/domain/pilot";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { setCompanyAddress } from "@/use-cases/company-address";
import { defaultGeocoder } from "@/use-cases/geocoding";

export type AddressState = { error?: string; warning?: string } | null;

export async function saveAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const { company } = await requireCompanyContext();

  const result = await setCompanyAddress(prisma, defaultGeocoder, {
    companyId: company.id,
    line: String(formData.get("line") ?? ""),
    district: String(formData.get("district") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    radiusKm: Number(formData.get("radiusKm") ?? 20),
    pilotGateEnabled: pilotGateEnabled(),
  });

  if (!result.ok) {
    return {
      error:
        result.error === "outside_pilot"
          ? "No piloto, só endereços em Colatina/ES."
          : "Endereço inválido. Confira rua, cidade e UF.",
    };
  }
  if (!result.value.geocoded) {
    return { warning: "Endereço salvo, mas não conseguimos localizar no mapa." };
  }

  redirect("/painel");
}
