import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
    <main>
      <h1>{job.title}</h1>
      <p>
        {job.companyName} · {job.vinculo} · {job.locationMode} ·{" "}
        {job.approxLocation}
        {job.compensationText ? ` · ${job.compensationText}` : ""}
      </p>
      <p>{job.description}</p>
      <p>
        {job.positions} vaga(s) · inscrições até{" "}
        {job.applicationDeadline.toLocaleDateString("pt-BR")}
      </p>

      {mine ? (
        <p role="status">Você já se candidatou ({mine.state}).</p>
      ) : (
        <form action={apply}>
          <p>
            <label>
              Mensagem <textarea name="coverMessage" rows={3} />
            </label>
          </p>
          <p>
            <label>
              Link do currículo (opcional){" "}
              <input name="resumeUrl" type="url" />
            </label>
          </p>
          <button type="submit">Candidatar-me</button>
        </form>
      )}
      <p>
        <Link href="/prof/vagas">Voltar</Link>
      </p>
    </main>
  );
}
