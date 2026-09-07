import { revalidatePath } from "next/cache";

import { Button, buttonClass } from "@/components/ui/button";
import { Panel } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { setNotificationOptOut } from "@/use-cases/consent";
import { exportMyData, requestDataDeletion } from "@/use-cases/data-subject";

export const dynamic = "force-dynamic";

const OPTIONAL_CATEGORIES = [
  ["digest", "Resumos periódicos"],
  ["marketing", "Novidades e dicas"],
] as const;

export default async function MeusDadosPage() {
  const { user, professionalProfileId } = await requireProfessional();
  const [data, optOuts] = await Promise.all([
    exportMyData(prisma, { userId: user.id }),
    prisma.notificationOptOut.findMany({
      where: { subjectId: professionalProfileId },
    }),
  ]);
  const optedOut = new Set(optOuts.map((o) => o.category));

  async function togglePref(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await setNotificationOptOut(prisma, {
      subjectId: pid,
      category: String(formData.get("category")),
      optOut: formData.get("optOut") === "1",
    });
    revalidatePath("/prof/meus-dados");
  }

  async function askDeletion() {
    "use server";
    const { user: u } = await requireProfessional();
    await requestDataDeletion(prisma, { userId: u.id });
    revalidatePath("/prof/meus-dados");
  }

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">
        Meus dados
      </h1>

      <Panel className="grid gap-3">
        <div>
          <h2 className="text-[0.8125rem] font-semibold text-fg-muted">
            Preferências de notificação
          </h2>
          <p className="mt-1 text-[0.8125rem] text-fg-subtle">
            Convocações e avisos essenciais não podem ser desligados.
          </p>
        </div>
        {OPTIONAL_CATEGORIES.map(([cat, label]) => {
          const off = optedOut.has(cat);
          return (
            <form
              key={cat}
              action={togglePref}
              className="flex items-center justify-between gap-3 border-t border-hairline pt-3 first:border-0 first:pt-0"
            >
              <input type="hidden" name="category" value={cat} />
              <input type="hidden" name="optOut" value={off ? "0" : "1"} />
              <span className="flex items-center gap-2 text-[0.875rem] text-fg">
                {label}
                <StatusPill tone={off ? "neutral" : "pos"} dotted={false}>
                  {off ? "desligado" : "ligado"}
                </StatusPill>
              </span>
              <button type="submit" className={buttonClass("secondary", "sm")}>
                {off ? "Ligar" : "Desligar"}
              </button>
            </form>
          );
        })}
      </Panel>

      <Panel className="grid gap-2">
        <h2 className="text-[0.8125rem] font-semibold text-fg-muted">
          Exportar meus dados
        </h2>
        <pre className="tnum max-h-60 overflow-auto rounded-md border border-hairline bg-panel-2 p-3 text-[0.75rem] leading-relaxed text-fg-muted">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Panel>

      <Panel className="grid gap-3">
        <h2 className="text-[0.8125rem] font-semibold text-fg-muted">
          Excluir minha conta
        </h2>
        <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
          Isso remove seus dados pessoais. O histórico de trabalho fica de forma
          pseudonimizada, pela necessidade legítima das empresas.
        </p>
        <form action={askDeletion}>
          <Button type="submit" variant="danger" size="sm">
            Solicitar exclusão
          </Button>
        </form>
      </Panel>
    </main>
  );
}
