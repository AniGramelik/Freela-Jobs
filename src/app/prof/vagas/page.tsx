import Link from "next/link";
import { CalendarClock, MapPin, Star } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { jobVinculoLabel } from "@/lib/labels";
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
    <main className="grid gap-4 px-4 py-6">
      <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">Vagas</h1>

      <form method="get" className="grid gap-2">
        <div className="grid grid-cols-[1fr_4rem] gap-2">
          <Input
            name="categoria"
            defaultValue={categoria ?? ""}
            placeholder="Categoria"
          />
          <Input
            name="uf"
            maxLength={2}
            defaultValue={uf ?? ""}
            placeholder="UF"
            className="uppercase"
          />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            name="cidade"
            defaultValue={cidade ?? ""}
            placeholder="Cidade"
          />
          <button type="submit" className={buttonClass("secondary", "md")}>
            Filtrar
          </button>
        </div>
      </form>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={18} strokeWidth={1.75} aria-hidden />}
          title="Nenhuma vaga"
          hint="Ajuste os filtros ou volte mais tarde."
        />
      ) : (
        <ul className="grid gap-2">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link
                href={`/prof/vagas/${j.id}`}
                className="block rounded-lg border border-hairline bg-panel p-4 shadow-sm no-underline transition-colors hover:bg-panel-2"
              >
                <div className="flex items-start gap-1.5">
                  {j.featured ? (
                    <Star
                      size={14}
                      strokeWidth={1.75}
                      aria-hidden
                      className="mt-0.5 shrink-0 fill-pend text-pend"
                    />
                  ) : null}
                  <p className="text-sm font-medium text-fg">{j.title}</p>
                </div>
                <p className="mt-0.5 text-[0.8125rem] text-fg-muted">
                  {j.companyName} · {jobVinculoLabel(j.vinculo)}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] text-fg-subtle">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} strokeWidth={1.75} aria-hidden />
                    {j.approxLocation}
                    {j.distanceKm != null ? ` · ~${j.distanceKm} km` : ""}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="tnum">
                    até {j.applicationDeadline.toLocaleDateString("pt-BR")}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
