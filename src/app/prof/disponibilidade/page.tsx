import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  getAvailability,
  setAvailabilityWindows,
  setAvailableNow,
} from "@/use-cases/availability";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SHIFTS: [string, string][] = [
  ["MORNING", "Manhã"],
  ["AFTERNOON", "Tarde"],
  ["NIGHT", "Noite"],
];

export default async function DisponibilidadePage() {
  const { professionalProfileId } = await requireProfessional();
  const availability = await getAvailability(prisma, { professionalProfileId });
  const selected = new Set(
    availability.windows.map((w) => `${w.weekday}:${w.shift}`),
  );

  async function save(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    const windows: { weekday: number; shift: string }[] = [];
    for (let d = 0; d < 7; d += 1) {
      for (const [shift] of SHIFTS) {
        if (formData.get(`w_${d}_${shift}`)) windows.push({ weekday: d, shift });
      }
    }
    await setAvailabilityWindows(prisma, {
      professionalProfileId: pid,
      windows,
    });
    revalidatePath("/prof/disponibilidade");
  }

  async function toggleNow(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await setAvailableNow(prisma, {
      professionalProfileId: pid,
      on: formData.get("on") === "1",
    });
    revalidatePath("/prof/disponibilidade");
  }

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="text-lg font-semibold tracking-[-0.01em] text-fg">
        Sua disponibilidade
      </h1>

      <Panel className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] text-fg-muted">Status agora</span>
          <StatusPill tone={availability.availableNow ? "pos" : "neutral"}>
            {availability.availableNow ? "disponível" : "indisponível"}
          </StatusPill>
        </div>
        <form action={toggleNow}>
          <input
            type="hidden"
            name="on"
            value={availability.availableNow ? "0" : "1"}
          />
          <Button
            type="submit"
            variant={availability.availableNow ? "secondary" : "primary"}
            className="w-full h-10"
          >
            {availability.availableNow
              ? "Desligar"
              : "Ficar disponível agora (8h)"}
          </Button>
        </form>
      </Panel>

      <form action={save} className="grid gap-3">
        <h2 className="text-[0.8125rem] font-semibold text-fg-muted">
          Janelas recorrentes
        </h2>
        <div className="overflow-hidden rounded-lg border border-hairline bg-panel shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-hairline bg-panel-2">
              <tr>
                <th className="px-3 py-2 text-left text-[0.75rem] font-semibold text-fg-subtle">
                  Dia
                </th>
                {SHIFTS.map(([s, label]) => (
                  <th
                    key={s}
                    className="px-3 py-2 text-center text-[0.75rem] font-semibold text-fg-subtle"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {WEEKDAYS.map((label, d) => (
                <tr key={d}>
                  <td className="px-3 py-2.5 font-medium text-fg">{label}</td>
                  {SHIFTS.map(([shift]) => (
                    <td key={shift} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        name={`w_${d}_${shift}`}
                        defaultChecked={selected.has(`${d}:${shift}`)}
                        className="size-4 accent-[var(--color-brand)]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="submit" variant="secondary" className="h-10">
          Salvar janelas
        </Button>
      </form>
    </main>
  );
}
