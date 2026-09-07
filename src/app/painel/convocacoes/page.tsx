import Link from "next/link";
import { Plus, Radio } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listCompanyCallOuts } from "@/use-cases/callouts";

export const dynamic = "force-dynamic";

const PILL = {
  DRAFT: { tone: "neutral", label: "Rascunho" },
  OPEN: { tone: "brand", label: "No ar" },
  FILLED: { tone: "pos", label: "Lotada" },
  CLOSED: { tone: "neutral", label: "Encerrada" },
  CANCELLED: { tone: "neg", label: "Cancelada" },
} as const;

export default async function ConvocacoesPage() {
  const { company } = await requireCompanyContext();
  const callouts = await listCompanyCallOuts(prisma, company.id);

  return (
    <PageShell wide>
      <PageHeader
        title="Convocações"
        meta={`${company.name} · ${callouts.length} no total`}
        actions={
          <Link
            href="/painel/convocacoes/nova"
            className={buttonClass("primary", "md")}
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
            Nova convocação
          </Link>
        }
      />

      {callouts.length === 0 ? (
        <EmptyState
          icon={<Radio size={18} strokeWidth={1.75} />}
          title="Nenhuma convocação ainda"
          hint="Chame gente da sua equipe para um turno — mais rápido que o grupo do WhatsApp."
          action={
            <Link
              href="/painel/convocacoes/nova"
              className={buttonClass("primary", "sm")}
            >
              Criar a primeira
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Função</TH>
              <TH className="hidden md:table-cell">Turno</TH>
              <TH className="hidden sm:table-cell">Modo</TH>
              <TH className="text-right">Vagas</TH>
              <TH>Situação</TH>
            </tr>
          </THead>
          <TBody>
            {callouts.map((c) => {
              const accepted = c.responses.filter(
                (r) => r.state === "ACCEPTED" || r.state === "COMPLETED",
              ).length;
              const pill = PILL[c.status];
              return (
                <TR key={c.id}>
                  <TD className="font-medium">
                    <Link
                      href={`/painel/convocacoes/${c.id}`}
                      className="no-underline hover:text-brand"
                    >
                      {c.role}
                    </Link>
                  </TD>
                  <TD className="tnum hidden text-fg-muted md:table-cell">
                    {c.shiftDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    {c.shiftStart}
                  </TD>
                  <TD className="hidden text-fg-muted sm:table-cell">
                    {c.mode === "OPEN" ? "Aberta" : "Nominal"}
                  </TD>
                  <TD className="tnum text-right">
                    <span
                      className={
                        accepted >= c.quantity ? "text-pos" : "text-fg"
                      }
                    >
                      {accepted}
                    </span>
                    <span className="text-fg-subtle">/{c.quantity}</span>
                  </TD>
                  <TD>
                    <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
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
