import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FormStatus, Input, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/layout";
import {
  applicationStateLabel,
  jobLocationModeLabel,
  jobVinculoLabel,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { applyToJob } from "@/use-cases/applications";
import { getJobDetail } from "@/use-cases/job-search";

export const dynamic = "force-dynamic";

export default async function VagaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { professionalProfileId } = await requireProfessional();
  const { id } = await params;
  const job = await getJobDetail(prisma, id);
  if (!job) notFound();

  const mine = await prisma.application.findUnique({
    where: {
      jobPostingId_professionalProfileId: {
        jobPostingId: id,
        professionalProfileId,
      },
    },
  });

  async function apply(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await applyToJob(prisma, {
      jobPostingId: id,
      professionalProfileId: pid,
      coverMessage: String(formData.get("coverMessage") ?? ""),
      resumeUrl: String(formData.get("resumeUrl") ?? ""),
    });
    redirect("/prof/candidaturas");
  }

  return (
    <main className="grid gap-4 px-4 py-6">
      <Link
        href="/prof/vagas"
        className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted no-underline hover:text-fg"
      >
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
        Vagas
      </Link>

      <div>
        <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">
          {job.title}
        </h1>
        <p className="mt-1 text-[0.8125rem] text-fg-muted">
          {job.companyName} · {jobVinculoLabel(job.vinculo)} ·{" "}
          {jobLocationModeLabel(job.locationMode)} · {job.approxLocation}
          {job.compensationText ? ` · ${job.compensationText}` : ""}
        </p>
        <p className="mt-1 tnum text-[0.8125rem] text-fg-subtle">
          {job.positions} vaga(s) · inscrições até{" "}
          {job.applicationDeadline.toLocaleDateString("pt-BR")}
        </p>
      </div>

      <Panel>
        <p className="text-[0.875rem] leading-relaxed whitespace-pre-line text-fg-muted">
          {job.description}
        </p>
      </Panel>

      {mine ? (
        <FormStatus>
          Você já se candidatou · {applicationStateLabel(mine.state)}.
        </FormStatus>
      ) : (
        <form action={apply}>
          <Panel className="grid gap-4">
            <Field label="Mensagem" htmlFor="coverMessage">
              <Textarea id="coverMessage" name="coverMessage" rows={3} />
            </Field>
            <Field
              label="Link do currículo"
              htmlFor="resumeUrl"
              hint="opcional"
            >
              <Input id="resumeUrl" name="resumeUrl" type="url" />
            </Field>
            <Button type="submit" className="h-10">
              Candidatar-me
            </Button>
          </Panel>
        </form>
      )}
    </main>
  );
}
