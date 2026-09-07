"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import {
  recordAttendance,
  submitInternalRating,
} from "@/use-cases/attendance";
import {
  cancelCallOut,
  createCallOut,
  publishCallOut,
} from "@/use-cases/callouts";

export type NewCallOutState = { error?: string } | null;

const MSG: Record<string, string> = {
  invalid: "Preencha função, data, horário e local.",
  targets_not_linked: "Escolha profissionais do seu acervo.",
  not_draft: "Convocação já publicada.",
  no_quantity: "Informe ao menos 1 vaga.",
  shift_past: "O turno precisa ser no futuro.",
  not_found: "Convocação não encontrada.",
};

export async function createCallOutAction(
  _prev: NewCallOutState,
  formData: FormData,
): Promise<NewCallOutState> {
  const { company } = await requireCompanyContext();
  const mode = formData.get("mode") === "OPEN" ? "OPEN" : "TARGETED";
  const targetProfileIds = formData.getAll("target").map(String);

  const created = await createCallOut(prisma, {
    companyId: company.id,
    mode,
    role: String(formData.get("role") ?? ""),
    shiftDate: new Date(String(formData.get("shiftDate"))),
    shiftStart: String(formData.get("shiftStart") ?? ""),
    shiftEnd: String(formData.get("shiftEnd") ?? "") || null,
    location: String(formData.get("location") ?? ""),
    compensationText: String(formData.get("compensationText") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    quantity: Number(formData.get("quantity") ?? 1),
    radiusKm: Number(formData.get("radiusKm") ?? 20),
    targetProfileIds,
  });
  if (!created.ok) return { error: MSG[created.error] };

  const published = await publishCallOut(prisma, {
    companyId: company.id,
    callOutId: created.value.callOutId,
  });
  if (!published.ok) return { error: MSG[published.error] };

  redirect(`/painel/convocacoes/${created.value.callOutId}`);
}

export async function attendanceAction(formData: FormData): Promise<void> {
  "use server";
  const { company } = await requireCompanyContext();
  await recordAttendance(prisma, {
    companyId: company.id,
    callOutId: String(formData.get("callOutId")),
    professionalProfileId: String(formData.get("professionalProfileId")),
    outcome: formData.get("outcome") === "NO_SHOW" ? "NO_SHOW" : "COMPLETED",
  });
  revalidatePath(`/painel/convocacoes/${formData.get("callOutId")}`);
}

export async function rateAction(formData: FormData): Promise<void> {
  "use server";
  const { company } = await requireCompanyContext();
  await submitInternalRating(prisma, {
    companyId: company.id,
    professionalProfileId: String(formData.get("professionalProfileId")),
    callOutId: String(formData.get("callOutId")) || null,
    score: Number(formData.get("score") ?? 0),
    comment: String(formData.get("comment") ?? "") || null,
  });
  revalidatePath(`/painel/convocacoes/${formData.get("callOutId")}`);
}

export async function cancelCallOutAction(formData: FormData): Promise<void> {
  "use server";
  const { company } = await requireCompanyContext();
  await cancelCallOut(prisma, {
    companyId: company.id,
    callOutId: String(formData.get("callOutId")),
  });
  revalidatePath("/painel/convocacoes");
}
