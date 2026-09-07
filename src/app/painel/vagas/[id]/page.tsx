import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import {
  listJobApplications,
  makeOffer,
  screenApplication,
} from "@/use-cases/applications";
import { cancelJob, featureJob } from "@/use-cases/job-postings";

export const dynamic = "force-dynamic";

export default async function VagaPainelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyContext();
  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job || job.companyId !== company.id) notFound();

  const applications = await listJobApplications(prisma, {
    companyId: company.id,
    jobPostingId: id,
  });

  async function screen(formData: FormData) {
    "use server";
    const { company: co } = await requireCompanyContext();
    await screenApplication(prisma, {
      companyId: co.id,
      applicationId: String(formData.get("applicationId")),
      to: formData.get("to") as "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED",
    });
    revalidatePath(`/painel/vagas/${id}`);
  }
  async function offer(formData: FormData) {
    "use server";
    const { company: co } = await requireCompanyContext();
    await makeOffer(prisma, {
      companyId: co.id,
      applicationId: String(formData.get("applicationId")),
    });
    revalidatePath(`/painel/vagas/${id}`);
  }
  async function feature() {
    "use server";
    const { company: co } = await requireCompanyContext();
    await featureJob(prisma, { companyId: co.id, jobId: id, days: 7 });
    revalidatePath(`/painel/vagas/${id}`);
  }
  async function close() {
    "use server";
    const { company: co } = await requireCompanyContext();
    await cancelJob(prisma, { companyId: co.id, jobId: id });
    revalidatePath(`/painel/vagas/${id}`);
  }

  const NEXT: Record<string, [string, string][]> = {
    SUBMITTED: [
      ["UNDER_REVIEW", "Analisar"],
      ["REJECTED", "Descartar"],
    ],
    UNDER_REVIEW: [
      ["SHORTLISTED", "Selecionar"],
      ["REJECTED", "Descartar"],
    ],
    SHORTLISTED: [["REJECTED", "Descartar"]],
  };

  return (
    <main>
      <h1>{job.title}</h1>
      <p>
        {job.status} · {job.positions} vaga(s) · até{" "}
        {job.applicationDeadline.toLocaleDateString("pt-BR")}
        {job.featuredUntil && job.featuredUntil > new Date()
          ? " · em destaque"
          : ""}
      </p>
      <form action={feature} style={{ display: "inline" }}>
        <button type="submit">Destacar 7 dias</button>
      </form>
      <form action={close} style={{ display: "inline" }}>
        <button type="submit">Encerrar vaga</button>
      </form>

      <h2>Candidaturas</h2>
      {applications.length === 0 ? (
        <p>Nenhuma candidatura.</p>
      ) : (
        <ul>
          {applications.map((a) => (
            <li key={a.id}>
              <strong>{a.professionalProfile.fullName}</strong> ·{" "}
              {a.professionalProfile.phoneE164} · <em>{a.state}</em>
              {a.coverMessage ? ` — "${a.coverMessage}"` : ""}
              {a.resumeUrl ? (
                <>
                  {" "}
                  <a href={a.resumeUrl}>currículo</a>
                </>
              ) : null}
              <div>
                {(NEXT[a.state] ?? []).map(([to, label]) => (
                  <form key={to} action={screen} style={{ display: "inline" }}>
                    <input type="hidden" name="applicationId" value={a.id} />
                    <input type="hidden" name="to" value={to} />
                    <button type="submit">{label}</button>
                  </form>
                ))}
                {a.state === "SHORTLISTED" ? (
                  <form action={offer} style={{ display: "inline" }}>
                    <input type="hidden" name="applicationId" value={a.id} />
                    <button type="submit">Fazer oferta</button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/painel/vagas">Voltar</Link>
      </p>
    </main>
  );
}
