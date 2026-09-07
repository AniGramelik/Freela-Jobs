import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";

import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  PageHeader,
  PageShell,
  SectionLabel,
} from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Tally } from "@/components/ui/tally";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

import { attendanceAction, cancelCallOutAction, rateAction } from "../actions";

export const dynamic = "force-dynamic";

const CALLOUT_PILL = {
  DRAFT: { tone: "neutral", label: "Rascunho" },
  OPEN: { tone: "brand", label: "No ar" },
  FILLED: { tone: "pos", label: "Lotada" },
  CLOSED: { tone: "neutral", label: "Encerrada" },
  CANCELLED: { tone: "neg", label: "Cancelada" },
} as const;

const RESPONSE_PILL = {
  OFFERED: { tone: "pend", label: "Chamando" },
  ACCEPTED: { tone: "brand", label: "Topou" },
  DECLINED: { tone: "neutral", label: "Recusou" },
  WITHDRAWN: { tone: "neg", label: "Desistiu" },
  NO_SHOW: { tone: "neg", label: "Faltou" },
  COMPLETED: { tone: "pos", label: "Compareceu" },
} as const;

export default async function ConvocacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyContext();
  const { id } = await params;

  const callout = await prisma.callOut.findUnique({
    where: { id },
    include: {
      responses: {
        orderBy: { createdAt: "asc" },
        include: {
          professionalProfile: {
            select: { id: true, fullName: true, phoneE164: true },
          },
        },
      },
    },
  });
  if (!callout || callout.companyId !== company.id) notFound();

  const filled = callout.responses.filter(
    (r) => r.state === "ACCEPTED" || r.state === "COMPLETED",
  ).length;
  const co = CALLOUT_PILL[callout.status];
  const shift = `${callout.shiftDate.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })} · ${callout.shiftStart}${callout.shiftEnd ? `–${callout.shiftEnd}` : ""}`;

  return (
    <PageShell wide>
      <Link
        href="/painel/convocacoes"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-fg-muted no-underline hover:text-fg"
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
        Convocações
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {callout.role}
            <StatusPill tone={co.tone}>{co.label}</StatusPill>
          </span>
        }
        meta={
          <span className="tnum">
            {shift} · {callout.location}
            {callout.compensationText ? (
              <> · {callout.compensationText}</>
            ) : null}
            {callout.mode === "OPEN" ? " · aberta" : " · nominal"}
          </span>
        }
        actions={
          <div className="flex items-center gap-4">
            <Tally filled={filled} total={callout.quantity} />
            {callout.status !== "CANCELLED" ? (
              <form action={cancelCallOutAction}>
                <input type="hidden" name="callOutId" value={callout.id} />
                <SubmitButton
                  variant="ghost"
                  size="sm"
                  pendingLabel="Cancelando…"
                >
                  Cancelar
                </SubmitButton>
              </form>
            ) : null}
          </div>
        }
      />

      {callout.notes ? (
        <p className="mb-5 rounded-md border border-hairline bg-panel-2 px-3 py-2 text-[0.8125rem] text-fg-muted">
          {callout.notes}
        </p>
      ) : null}

      <SectionLabel>Chamada — {callout.responses.length} pessoa(s)</SectionLabel>

      {callout.responses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline-strong bg-panel px-4 py-10 text-center text-[0.8125rem] text-fg-subtle">
          Ninguém foi chamado ainda.
        </p>
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Profissional</TH>
              <TH className="hidden sm:table-cell">Telefone</TH>
              <TH>Situação</TH>
              <TH className="text-right">Presença</TH>
              <TH className="text-right">Avaliar</TH>
            </tr>
          </THead>
          <TBody>
            {callout.responses.map((r) => {
              const pill = RESPONSE_PILL[r.state];
              const acting = r.state === "ACCEPTED";
              return (
                <TR key={r.id} focused={acting}>
                  <TD className="font-medium">
                    {r.professionalProfile.fullName}
                  </TD>
                  <TD className="tnum hidden text-fg-muted sm:table-cell">
                    {r.professionalProfile.phoneE164}
                  </TD>
                  <TD>
                    <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
                  </TD>
                  <TD className="text-right">
                    {r.state === "ACCEPTED" ? (
                      <div className="inline-flex gap-1.5">
                        <form
                          action={attendanceAction}
                          className="contents"
                        >
                          <input
                            type="hidden"
                            name="callOutId"
                            value={callout.id}
                          />
                          <input
                            type="hidden"
                            name="professionalProfileId"
                            value={r.professionalProfile.id}
                          />
                          <input
                            type="hidden"
                            name="outcome"
                            value="COMPLETED"
                          />
                          <SubmitButton
                            variant="secondary"
                            size="sm"
                            pendingLabel="Salvando…"
                          >
                            <Check size={14} strokeWidth={2} aria-hidden />
                            Compareceu
                          </SubmitButton>
                        </form>
                        <form
                          action={attendanceAction}
                          className="contents"
                        >
                          <input
                            type="hidden"
                            name="callOutId"
                            value={callout.id}
                          />
                          <input
                            type="hidden"
                            name="professionalProfileId"
                            value={r.professionalProfile.id}
                          />
                          <input type="hidden" name="outcome" value="NO_SHOW" />
                          <SubmitButton
                            variant="ghost"
                            size="sm"
                            pendingLabel="Salvando…"
                          >
                            <X size={14} strokeWidth={2} aria-hidden />
                            Faltou
                          </SubmitButton>
                        </form>
                      </div>
                    ) : (
                      <span className="text-[0.8125rem] text-fg-subtle">—</span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <form
                      action={rateAction}
                      className="inline-flex items-center gap-1.5"
                    >
                      <input
                        type="hidden"
                        name="callOutId"
                        value={callout.id}
                      />
                      <input
                        type="hidden"
                        name="professionalProfileId"
                        value={r.professionalProfile.id}
                      />
                      <Select
                        name="score"
                        defaultValue="5"
                        aria-label="Nota"
                        className="h-8 w-14"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </Select>
                      <input
                        name="comment"
                        placeholder="nota interna"
                        className="h-8 w-32 rounded-md border border-hairline-strong bg-panel px-2 text-[0.8125rem] placeholder:text-fg-subtle focus:border-brand focus:outline-2 focus:outline-[var(--color-ring)]"
                      />
                      <SubmitButton
                        variant="ghost"
                        size="sm"
                        pendingLabel="Salvando…"
                      >
                        Salvar
                      </SubmitButton>
                    </form>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      <p className="mt-3 text-[0.75rem] text-fg-subtle">
        A avaliação interna é privada da sua empresa — o profissional nunca a vê.
      </p>
    </PageShell>
  );
}
