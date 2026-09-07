import Link from "next/link";

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
    <main>
      <h1>Vagas — {company.name}</h1>
      <p>
        Plano {plan.tier} · {active}/{plan.activeJobLimit} vagas ativas.
      </p>
      <p>
        <Link href="/painel/vagas/nova">Publicar vaga</Link>
      </p>

      {jobs.length === 0 ? (
        <p>Nenhuma vaga ainda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Vínculo</th>
              <th>Local</th>
              <th>Vagas</th>
              <th>Status</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.vinculo}</td>
                <td>
                  {j.locationMode}
                  {j.city ? ` · ${j.city}/${j.state}` : ""}
                </td>
                <td>{j.positions}</td>
                <td>{j.status}</td>
                <td><Link href={`/painel/vagas/${j.id}`}>{j.applicationDeadline.toLocaleDateString("pt-BR")} · abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <Link href="/painel">Voltar</Link>
      </p>
    </main>
  );
}
