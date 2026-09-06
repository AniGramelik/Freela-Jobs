import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listCompanyProfessionals } from "@/use-cases/professionals";

export const dynamic = "force-dynamic";

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { company } = await requireCompanyContext();
  const { q } = await searchParams;

  const people = await listCompanyProfessionals(prisma, {
    companyId: company.id,
    query: q,
  });

  return (
    <main>
      <h1>Equipe — {company.name}</h1>

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
