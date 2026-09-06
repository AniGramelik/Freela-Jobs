import Link from "next/link";

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
    <main>
      <h1>Equipe — {company.name}</h1>

      {convite ? (
        <p role="status">{CONVITE_MSG[convite] ?? "Convite processado."}</p>
      ) : null}

      <form method="get">
        <label>
          Buscar por nome, telefone ou função{" "}
          <input type="search" name="q" defaultValue={q ?? ""} />
        </label>{" "}
        <button type="submit">Buscar</button>
      </form>

      <p>
        <Link href="/painel/equipe/nova">Adicionar profissional</Link>
      </p>

      {people.length === 0 ? (
        <p>Nenhum profissional {q ? "para essa busca" : "ainda"}.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Funções</th>
              <th>Estado</th>
              <th>Nota privada</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.relationshipId}>
                <td>{p.fullName}</td>
                <td>{p.phoneE164}</td>
                <td>{p.roles.join(", ") || "—"}</td>
                <td>{p.profileState}</td>
                <td>{p.privateNote ?? "—"}</td>
                <td>
                  {p.profileState === "CLAIMED" ? (
                    "assumido"
                  ) : (
                    <form action="/painel/equipe/convidar" method="post">
                      <input
                        type="hidden"
                        name="professionalProfileId"
                        value={p.profileId}
                      />
                      <button type="submit">
                        {p.profileState === "INVITED" ? "Reenviar convite" : "Convidar"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <Link href="/painel">Voltar ao painel</Link>
      </p>
    </main>
  );
}
