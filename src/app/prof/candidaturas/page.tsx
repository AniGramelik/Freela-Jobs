import { revalidatePath } from "next/cache";

import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  listMyApplications,
  respondToOffer,
  withdrawApplication,
} from "@/use-cases/applications";

export const dynamic = "force-dynamic";

const PILL: Record<
  string,
  { tone: "neutral" | "pos" | "neg" | "pend" | "brand"; label: string }
> = {
  SUBMITTED: { tone: "pend", label: "Enviada" },
  UNDER_REVIEW: { tone: "brand", label: "Em análise" },
  SHORTLISTED: { tone: "pos", label: "Selecionada" },
  OFFERED: { tone: "brand", label: "Oferta recebida" },
  ACCEPTED: { tone: "pos", label: "Aceita" },
  REJECTED: { tone: "neg", label: "Descartada" },
  WITHDRAWN: { tone: "neutral", label: "Retirada" },
};

export default async function CandidaturasPage() {
  const { professionalProfileId } = await requireProfessional();
  const apps = await listMyApplications(prisma, { professionalProfileId });

  async function offerResponse(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await respondToOffer(prisma, {
      professionalProfileId: pid,
      applicationId: String(formData.get("applicationId")),
      action: formData.get("action") === "accept" ? "accept" : "decline",
    });
    revalidatePath("/prof/candidaturas");
  }

  async function withdraw(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await withdrawApplication(prisma, {
      professionalProfileId: pid,
      applicationId: String(formData.get("applicationId")),
    });
    revalidatePath("/prof/candidaturas");
  }

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">
        Minhas candidaturas
      </h1>

      {apps.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura"
          hint="As vagas em que você se candidatar aparecem aqui."
        />
      ) : (
        <ul className="grid gap-2">
          {apps.map((a) => {
            const pill = PILL[a.state] ?? {
              tone: "neutral" as const,
              label: a.state,
            };
            return (
              <li
                key={a.id}
                className="rounded-lg border border-hairline bg-panel p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">
                      {a.jobPosting.title}
                    </p>
                    <p className="text-[0.8125rem] text-fg-subtle">
                      {a.jobPosting.company.name}
                    </p>
                  </div>
                  <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
                </div>

                {a.state === "OFFERED" ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <form action={offerResponse}>
                      <input type="hidden" name="applicationId" value={a.id} />
                      <input type="hidden" name="action" value="accept" />
                      <button
                        type="submit"
                        className={buttonClass("primary", "md", "w-full h-10")}
                      >
                        Aceitar oferta
                      </button>
                    </form>
                    <form action={offerResponse}>
                      <input type="hidden" name="applicationId" value={a.id} />
                      <input type="hidden" name="action" value="decline" />
                      <button
                        type="submit"
                        className={buttonClass("secondary", "md", "w-full h-10")}
                      >
                        Recusar
                      </button>
                    </form>
                  </div>
                ) : ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED"].includes(
                    a.state,
                  ) ? (
                  <form action={withdraw} className="mt-3">
                    <input type="hidden" name="applicationId" value={a.id} />
                    <button
                      type="submit"
                      className={buttonClass("ghost", "sm")}
                    >
                      Retirar
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
