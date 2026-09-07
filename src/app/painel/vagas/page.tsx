import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  jobLocationModeLabel,
  jobStatusLabel,
  jobStatusTone,
  jobVinculoLabel,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { getCompanyPlan } from "@/use-cases/company-plan";
import { listCompanyJobs } from "@/use-cases/job-postings";

export const dynamic = "force-dynamic";

export default async function VagasPage() {
  const { company } = await requireCompanyContext();
  const [jobs, plan] = await Promise.all([
    listCompanyJobs(prisma, company.id),
    getCompanyPlan(prisma, company.id),
  ]);
  const active = jobs.filter((j) => j.status === "PUBLISHED").length;

  return (
    <PageShell wide>
      <PageHeader
        title="Vagas"
        meta={`Plano ${plan.tier} · ${active}/${plan.activeJobLimit} vagas ativas`}
        actions={
          <Link
            href="/painel/vagas/nova"
            className={buttonClass("primary", "md")}
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
            Publicar vaga
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={18} strokeWidth={1.75} aria-hidden />}
          title="Nenhuma vaga ainda"
          hint="Publique uma vaga no mural e comece a receber candidaturas."
          action={
            <Link
              href="/painel/vagas/nova"
              className={buttonClass("primary", "sm")}
            >
              Publicar vaga
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Título</TH>
              <TH className="hidden sm:table-cell">Vínculo</TH>
              <TH className="hidden md:table-cell">Local</TH>
              <TH className="text-right">Vagas</TH>
              <TH>Status</TH>
              <TH className="text-right">Prazo</TH>
            </TR>
          </THead>
          <TBody>
            {jobs.map((j) => {
              return (
                <TR key={j.id}>
                  <TD className="font-medium text-fg">
                    <Link
                      href={`/painel/vagas/${j.id}`}
                      className="no-underline hover:text-brand"
                    >
                      {j.title}
                    </Link>
                  </TD>
                  <TD className="hidden text-fg-muted sm:table-cell">
                    {jobVinculoLabel(j.vinculo)}
                  </TD>
                  <TD className="hidden text-fg-muted md:table-cell">
                    {jobLocationModeLabel(j.locationMode)}
                    {j.city ? ` · ${j.city}/${j.state}` : ""}
                  </TD>
                  <TD className="text-right tnum">{j.positions}</TD>
                  <TD>
                    <StatusPill tone={jobStatusTone[j.status] ?? "neutral"}>
                      {jobStatusLabel(j.status)}
                    </StatusPill>
                  </TD>
                  <TD className="text-right tnum text-fg-muted">
                    {j.applicationDeadline.toLocaleDateString("pt-BR")}
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
