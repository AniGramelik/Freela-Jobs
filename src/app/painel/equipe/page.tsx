import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listCompanyProfessionals } from "@/use-cases/professionals";

export const dynamic = "force-dynamic";

const CONVITE_MSG: Record<string, string> = {
  enviado: "Convite enviado.",
  no_email: "Cadastre um e-mail no perfil para convidar.",
  already_claimed: "Esse profissional já assumiu o perfil.",
  not_found: "Profissional não encontrado.",
};

const STATE_LABEL: Record<string, string> = {
  DRAFT: "rascunho",
  INVITED: "convidado",
  CLAIMED: "assumido",
};

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; convite?: string }>;
}) {
  const { company } = await requireCompanyContext();
  const { q, convite } = await searchParams;

  const people = await listCompanyProfessionals(prisma, {
    companyId: company.id,
    query: q,
  });

  return (
    <PageShell wide>
      <PageHeader
        title="Equipe"
        meta={`Acervo de profissionais de ${company.name}`}
        actions={
          <Link
            href="/painel/equipe/nova"
            className={buttonClass("primary", "md")}
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
            Adicionar
          </Link>
        }
      />

      {convite ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-pos/30 bg-pos-soft px-3 py-2 text-[0.8125rem] text-pos"
        >
          {CONVITE_MSG[convite] ?? "Convite processado."}
        </p>
      ) : null}

      <form method="get" className="mb-4 flex gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, telefone ou função"
          className="max-w-xs"
        />
        <button type="submit" className={buttonClass("secondary", "md")}>
          Buscar
        </button>
      </form>

      {people.length === 0 ? (
        <EmptyState
          icon={<Users size={18} strokeWidth={1.75} aria-hidden />}
          title={q ? "Nada para essa busca" : "Nenhum profissional ainda"}
          hint={
            q
              ? "Tente outro termo."
              : "Cadastre quem você já chama e convide para assumir o perfil."
          }
          action={
            <Link
              href="/painel/equipe/nova"
              className={buttonClass("primary", "sm")}
            >
              Adicionar profissional
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH className="hidden sm:table-cell">Telefone</TH>
              <TH>Funções</TH>
              <TH>Estado</TH>
              <TH className="hidden md:table-cell">Nota privada</TH>
              <TH>
                <span className="sr-only">Ações</span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {people.map((p) => (
              <TR key={p.relationshipId}>
                <TD className="font-medium text-fg">{p.fullName}</TD>
                <TD className="hidden tnum sm:table-cell">{p.phoneE164}</TD>
                <TD>{p.roles.join(", ") || "—"}</TD>
                <TD>
                  <StatusPill
                    tone={p.profileState === "CLAIMED" ? "pos" : "neutral"}
                  >
                    {STATE_LABEL[p.profileState] ?? p.profileState}
                  </StatusPill>
                </TD>
                <TD className="hidden max-w-[16rem] truncate text-fg-subtle md:table-cell">
                  {p.privateNote ?? "—"}
                </TD>
                <TD className="text-right">
                  {p.profileState === "CLAIMED" ? (
                    <span className="text-[0.8125rem] text-fg-subtle">
                      assumido
                    </span>
                  ) : (
                    <form action="/painel/equipe/convidar" method="post">
                      <input
                        type="hidden"
                        name="professionalProfileId"
                        value={p.profileId}
                      />
                      <button
                        type="submit"
                        className={buttonClass("ghost", "sm")}
                      >
                        {p.profileState === "INVITED"
                          ? "Reenviar convite"
                          : "Convidar"}
                      </button>
                    </form>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </PageShell>
  );
}
