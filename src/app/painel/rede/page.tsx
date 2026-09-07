import { revalidatePath } from "next/cache";
import { Search, Star } from "lucide-react";

import { Button, buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { reportContent } from "@/use-cases/moderation";
import {
  invitePublicProfessional,
  searchPublicNetwork,
} from "@/use-cases/public-search";

export const dynamic = "force-dynamic";

export default async function PainelRedePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; msg?: string }>;
}) {
  const { company, user } = await requireCompanyContext();
  const { role, msg } = await searchParams;

  const results = role
    ? await searchPublicNetwork(prisma, { companyId: company.id, role })
    : [];

  async function invite(formData: FormData) {
    "use server";
    const { company: co } = await requireCompanyContext();
    await invitePublicProfessional(prisma, {
      companyId: co.id,
      professionalProfileId: String(formData.get("professionalProfileId")),
    });
    revalidatePath("/painel/rede");
  }

  async function report(formData: FormData) {
    "use server";
    await reportContent(prisma, {
      reporterUserId: user.id,
      targetType: "professional_profile",
      targetId: String(formData.get("professionalProfileId")),
      reason: String(formData.get("reason") ?? "denúncia da rede"),
    });
    revalidatePath("/painel/rede");
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Rede local"
        meta="Profissionais fora da sua base que aceitam propostas."
      />

      {msg ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-pos/30 bg-pos-soft px-3 py-2 text-[0.8125rem] text-pos"
        >
          {msg}
        </p>
      ) : null}

      <form method="get" className="mb-5 flex gap-2">
        <Input
          name="role"
          defaultValue={role ?? ""}
          required
          placeholder="Função — ex.: garçom"
          className="max-w-xs"
        />
        <button type="submit" className={buttonClass("primary", "md")}>
          <Search size={16} strokeWidth={1.75} aria-hidden />
          Buscar
        </button>
      </form>

      {role && results.length === 0 ? (
        <EmptyState
          icon={<Search size={18} strokeWidth={1.75} aria-hidden />}
          title="Ninguém por perto"
          hint="Não há profissionais públicos para essa função na sua região."
        />
      ) : results.length > 0 ? (
        <ul className="grid gap-2">
          {results.map((r) => (
            <li
              key={r.professionalProfileId}
              className="rounded-lg border border-hairline bg-panel p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">{r.fullName}</p>
                  <p className="text-[0.8125rem] text-fg-subtle">
                    {r.roles.join(", ")}
                  </p>
                </div>
                {r.reputation ? (
                  <span className="inline-flex items-center gap-1 text-[0.8125rem] text-fg-muted">
                    <Star
                      size={13}
                      strokeWidth={1.75}
                      aria-hidden
                      className="fill-pend text-pend"
                    />
                    <span className="tnum">{r.reputation.average}</span>
                    <span className="text-fg-subtle">
                      ({r.reputation.count})
                    </span>
                  </span>
                ) : null}
              </div>

              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-fg-muted">
                <div className="flex gap-1">
                  <dt className="text-fg-subtle">Local</dt>
                  <dd>{r.approxLocation}</dd>
                </div>
                {r.distanceKm != null ? (
                  <div className="flex gap-1">
                    <dt className="text-fg-subtle">Distância</dt>
                    <dd className="tnum">~{r.distanceKm} km</dd>
                  </div>
                ) : null}
                {r.phone ? (
                  <div className="flex gap-1">
                    <dt className="text-fg-subtle">Telefone</dt>
                    <dd className="tnum">{r.phone}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={invite}>
                  <input
                    type="hidden"
                    name="professionalProfileId"
                    value={r.professionalProfileId}
                  />
                  <Button type="submit" size="sm">
                    Convidar
                  </Button>
                </form>
                <form action={report} className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="professionalProfileId"
                    value={r.professionalProfileId}
                  />
                  <Input
                    name="reason"
                    placeholder="Motivo da denúncia"
                    className="h-8 max-w-[12rem] text-[0.8125rem]"
                  />
                  <button
                    type="submit"
                    className={buttonClass("ghost", "sm")}
                  >
                    Denunciar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}
