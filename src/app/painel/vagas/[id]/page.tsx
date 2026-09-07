import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, FileText } from "lucide-react";

import { Button, buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  applicationStateLabel,
  applicationStateTone,
  jobStatusLabel,
  jobStatusTone,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import {
  listJobApplications,
  makeOffer,
  screenApplication,
} from "@/use-cases/applications";
import { cancelJob, featureJob } from "@/use-cases/job-postings";

export const dynamic = "force-dynamic";

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

const ACTIONABLE = new Set([
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "OFFERED",
]);

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

  const featured = job.featuredUntil && job.featuredUntil > new Date();

  return (
    <PageShell wide>
      <Link
        href="/painel/vagas"
        className="mb-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted no-underline hover:text-fg"
      >
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
        Vagas
      </Link>

      <PageHeader
        title={job.title}
        meta={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusPill tone={jobStatusTone[job.status] ?? "neutral"}>
              {jobStatusLabel(job.status)}
            </StatusPill>
            <span className="tnum">{job.positions} vaga(s)</span>
            <span aria-hidden>·</span>
            <span className="tnum">
              até {job.applicationDeadline.toLocaleDateString("pt-BR")}
            </span>
            {featured ? (
              <StatusPill tone="brand">em destaque</StatusPill>
            ) : null}
          </span>
        }
        actions={
          <>
            <form action={feature}>
              <Button type="submit" variant="secondary" size="sm">
                Destacar 7 dias
              </Button>
            </form>
            <form action={close}>
              <Button type="submit" variant="ghost" size="sm">
                Encerrar
              </Button>
            </form>
          </>
        }
      />

      <h2 className="mb-3 mt-2 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-fg-muted">
        Candidaturas
        {applications.length ? (
          <span className="tnum text-fg-subtle">{applications.length}</span>
        ) : null}
      </h2>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText size={18} strokeWidth={1.75} aria-hidden />}
          title="Nenhuma candidatura"
          hint="Assim que alguém se candidatar, aparece aqui."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Profissional</TH>
              <TH className="hidden sm:table-cell">Telefone</TH>
              <TH className="hidden md:table-cell">Mensagem</TH>
              <TH>Situação</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {applications.map((a) => {
              const steps = NEXT[a.state] ?? [];
              const canOffer = a.state === "SHORTLISTED";
              return (
                <TR key={a.id} focused={ACTIONABLE.has(a.state)}>
                  <TD className="font-medium text-fg">
                    {a.professionalProfile.fullName}
                    {a.resumeUrl ? (
                      <a
                        href={a.resumeUrl}
                        className="ml-2 inline-flex items-center gap-1 align-middle text-[0.75rem] font-normal text-brand"
                      >
                        <FileText size={12} strokeWidth={1.75} aria-hidden />
                        currículo
                      </a>
                    ) : null}
                  </TD>
                  <TD className="hidden tnum text-fg-muted sm:table-cell">
                    {a.professionalProfile.phoneE164}
                  </TD>
                  <TD className="hidden max-w-[22rem] truncate text-fg-muted md:table-cell">
                    {a.coverMessage || "—"}
                  </TD>
                  <TD>
                    <StatusPill tone={applicationStateTone[a.state] ?? "neutral"}>
                      {applicationStateLabel(a.state)}
                    </StatusPill>
                  </TD>
                  <TD>
                    {steps.length > 0 || canOffer ? (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {steps.map(([to, label]) => (
                          <form key={to} action={screen}>
                            <input
                              type="hidden"
                              name="applicationId"
                              value={a.id}
                            />
                            <input type="hidden" name="to" value={to} />
                            <button
                              type="submit"
                              className={buttonClass(
                                to === "REJECTED" ? "ghost" : "secondary",
                                "sm",
                              )}
                            >
                              {label}
                            </button>
                          </form>
                        ))}
                        {canOffer ? (
                          <form action={offer}>
                            <input
                              type="hidden"
                              name="applicationId"
                              value={a.id}
                            />
                            <button
                              type="submit"
                              className={buttonClass("primary", "sm")}
                            >
                              Fazer oferta
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ) : (
                      <span className="block text-right text-[0.8125rem] text-fg-subtle">
                        —
                      </span>
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </PageShell>
  );
}
