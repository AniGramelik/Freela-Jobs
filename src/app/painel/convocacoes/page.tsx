import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listCompanyCallOuts } from "@/use-cases/callouts";

export const dynamic = "force-dynamic";

export default async function ConvocacoesPage() {
  const { company } = await requireCompanyContext();
  const callouts = await listCompanyCallOuts(prisma, company.id);

  return (
    <main>
      <h1>Convocações — {company.name}</h1>
      <p>
        <Link href="/painel/convocacoes/nova">Nova convocação</Link>
      </p>
      {callouts.length === 0 ? (
        <p>Nenhuma convocação ainda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Função</th>
              <th>Turno</th>
              <th>Modo</th>
              <th>Vagas</th>
              <th>Aceitaram</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {callouts.map((c) => {
              const accepted = c.responses.filter(
                (r) => r.state === "ACCEPTED" || r.state === "COMPLETED",
              ).length;
              return (
                <tr key={c.id}>
                  <td>{c.role}</td>
                  <td>
                    {c.shiftDate.toLocaleDateString("pt-BR")} {c.shiftStart}
                  </td>
                  <td>{c.mode}</td>
                  <td>{c.quantity}</td>
                  <td>
                    {accepted}/{c.quantity}
                  </td>
                  <td>{c.status}</td>
                  <td>
                    <Link href={`/painel/convocacoes/${c.id}`}>abrir</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p>
        <Link href="/painel">Voltar</Link>
      </p>
    </main>
  );
}
