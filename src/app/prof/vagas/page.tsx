import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { searchJobs } from "@/use-cases/job-search";

export const dynamic = "force-dynamic";

export default async function ProfVagasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; uf?: string; cidade?: string }>;
}) {
  const { professionalProfileId } = await requireProfessional();
  const { categoria, uf, cidade } = await searchParams;

  const jobs = await searchJobs(prisma, {
    categorySlug: categoria,
    uf,
    city: cidade,
    professionalProfileId,
  });

  return (
    <main>
      <h1>Vagas</h1>
      <form method="get">
        <label>
          Categoria <input name="categoria" defaultValue={categoria ?? ""} />
        </label>{" "}
        <label>
          UF <input name="uf" maxLength={2} defaultValue={uf ?? ""} />
        </label>{" "}
        <label>
          Cidade <input name="cidade" defaultValue={cidade ?? ""} />
        </label>{" "}
        <button type="submit">Filtrar</button>
      </form>

      {jobs.length === 0 ? (
        <p>Nenhuma vaga.</p>
      ) : (
        <ul>
          {jobs.map((j) => (
            <li key={j.id}>
              {j.featured ? "★ " : ""}
              <Link href={`/prof/vagas/${j.id}`}>{j.title}</Link> —{" "}
              {j.companyName} · {j.vinculo} · {j.approxLocation}
              {j.distanceKm != null ? ` · ~${j.distanceKm} km` : ""} · até{" "}
              {j.applicationDeadline.toLocaleDateString("pt-BR")}
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/prof">Voltar</Link>
      </p>
    </main>
  );
}
