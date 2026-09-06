"use server";

import { redirect } from "next/navigation";

import type { JobLocationMode, JobVinculo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { defaultGeocoder } from "@/use-cases/geocoding";
import { createJobDraft, publishJob } from "@/use-cases/job-postings";

export type NewJobState = { error?: string } | null;

const MESSAGES: Record<string, string> = {
  invalid: "Preencha título, descrição e categoria.",
  job_limit_reached:
    "Você atingiu o limite de vagas ativas do seu plano. Feche uma vaga ou use destaque.",
  deadline_past: "O prazo de inscrição precisa ser no futuro.",
  missing_fields: "Faltam campos obrigatórios.",
  no_positions: "Informe ao menos 1 vaga.",
  not_found: "Vaga não encontrada.",
  not_draft: "Essa vaga já foi publicada.",
};

export async function createAndPublishJobAction(
  _prev: NewJobState,
  formData: FormData,
): Promise<NewJobState> {
  const { company } = await requireCompanyContext();

  const draft = await createJobDraft(prisma, {
    companyId: company.id,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    categorySlug: String(formData.get("categorySlug") ?? ""),
    vinculo: String(formData.get("vinculo") ?? "DIARIA") as JobVinculo,
    locationMode: String(
      formData.get("locationMode") ?? "PRESENCIAL",
    ) as JobLocationMode,
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    radiusKm: Number(formData.get("radiusKm") ?? 20),
    compensationText: String(formData.get("compensationText") ?? ""),
    positions: Number(formData.get("positions") ?? 1),
    applicationDeadline: new Date(String(formData.get("applicationDeadline"))),
  });
  if (!draft.ok) return { error: MESSAGES[draft.error] };

  const published = await publishJob(prisma, defaultGeocoder, {
    companyId: company.id,
    jobId: draft.value.jobId,
  });
  if (!published.ok) return { error: MESSAGES[published.error] };

  redirect("/painel/vagas");
}
