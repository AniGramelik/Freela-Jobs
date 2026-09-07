import { EmptyState } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { getMyWorkHistory } from "@/use-cases/attendance";

export const dynamic = "force-dynamic";

const STATE: Record<
  string,
  { tone: "neutral" | "pos" | "neg" | "pend" | "brand"; label: string }
> = {
  PRESENT: { tone: "pos", label: "Compareceu" },
  ABSENT: { tone: "neg", label: "Faltou" },
  PENDING: { tone: "pend", label: "Sem registro" },
};

export default async function HistoricoPage() {
  const { professionalProfileId } = await requireProfessional();
  const history = await getMyWorkHistory(prisma, { professionalProfileId });

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="text-lg font-semibold tracking-[-0.01em] text-fg">
        Meu histórico
      </h1>

      {history.length === 0 ? (
        <EmptyState
          title="Nada registrado ainda"
          hint="Seus turnos concluídos aparecem aqui."
        />
      ) : (
        <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-panel shadow-sm">
          {history.map((h) => {
            const s = STATE[h.state] ?? {
              tone: "neutral" as const,
              label: h.state,
            };
            return (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {h.callOut.role}
                  </p>
                  <p className="text-[0.8125rem] text-fg-subtle">
                    {h.callOut.company.name} ·{" "}
                    <span className="tnum">
                      {h.callOut.shiftDate.toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>
                <StatusPill tone={s.tone}>{s.label}</StatusPill>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
