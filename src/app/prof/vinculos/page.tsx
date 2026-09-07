import { revalidatePath } from "next/cache";

import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  archiveRelationship,
  listMyRelationships,
  respondToRelationship,
} from "@/use-cases/my-relationships";

export const dynamic = "force-dynamic";

const STATE: Record<
  string,
  { tone: "neutral" | "pos" | "neg" | "pend" | "brand"; label: string }
> = {
  PENDING_CONSENT: { tone: "pend", label: "Aguarda seu aceite" },
  ACTIVE: { tone: "pos", label: "Ativo" },
  DECLINED: { tone: "neg", label: "Recusado" },
  ARCHIVED: { tone: "neutral", label: "Arquivado" },
};

export default async function VinculosPage() {
  const { professionalProfileId } = await requireProfessional();
  const relationships = await listMyRelationships(prisma, {
    professionalProfileId,
  });

  async function respond(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await respondToRelationship(prisma, {
      professionalProfileId: pid,
      relationshipId: String(formData.get("relationshipId")),
      action: formData.get("action") === "accept" ? "accept" : "decline",
    });
    revalidatePath("/prof/vinculos");
  }

  async function archive(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await archiveRelationship(prisma, {
      professionalProfileId: pid,
      relationshipId: String(formData.get("relationshipId")),
    });
    revalidatePath("/prof/vinculos");
  }

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="text-lg font-semibold tracking-[-0.01em] text-fg">
        Meus vínculos
      </h1>

      {relationships.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa ainda"
          hint="Quando uma empresa te cadastrar, o vínculo aparece aqui para você aceitar."
        />
      ) : (
        <ul className="grid gap-2">
          {relationships.map((r) => {
            const s = STATE[r.state] ?? {
              tone: "neutral" as const,
              label: r.state,
            };
            return (
              <li
                key={r.relationshipId}
                className="rounded-lg border border-hairline bg-panel p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">
                      {r.companyName}
                    </p>
                    {r.roles.length > 0 ? (
                      <p className="text-[0.8125rem] text-fg-subtle">
                        {r.roles.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill tone={s.tone}>{s.label}</StatusPill>
                </div>

                {r.state === "PENDING_CONSENT" ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <form action={respond}>
                      <input
                        type="hidden"
                        name="relationshipId"
                        value={r.relationshipId}
                      />
                      <input type="hidden" name="action" value="accept" />
                      <button
                        type="submit"
                        className={buttonClass("primary", "md", "w-full h-10")}
                      >
                        Aceitar
                      </button>
                    </form>
                    <form action={respond}>
                      <input
                        type="hidden"
                        name="relationshipId"
                        value={r.relationshipId}
                      />
                      <input type="hidden" name="action" value="decline" />
                      <button
                        type="submit"
                        className={buttonClass("secondary", "md", "w-full h-10")}
                      >
                        Recusar
                      </button>
                    </form>
                  </div>
                ) : r.state === "ACTIVE" ? (
                  <form action={archive} className="mt-3">
                    <input
                      type="hidden"
                      name="relationshipId"
                      value={r.relationshipId}
                    />
                    <button
                      type="submit"
                      className={buttonClass("ghost", "sm")}
                    >
                      Arquivar
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
