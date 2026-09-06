import Link from "next/link";
import { revalidatePath } from "next/cache";

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
    <main>
      <h1>Sua disponibilidade</h1>

      <form action={toggleNow}>
        <input type="hidden" name="on" value={availability.availableNow ? "0" : "1"} />
        <p>
          Status agora:{" "}
          <strong>{availability.availableNow ? "disponível" : "indisponível"}</strong>
        </p>
        <button type="submit">
          {availability.availableNow ? "Desligar" : "Ficar disponível agora (8h)"}
        </button>
      </form>

      <form action={save}>
        <h2>Janelas recorrentes</h2>
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              {SHIFTS.map(([s, label]) => (
                <th key={s}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((label, d) => (
              <tr key={d}>
                <td>{label}</td>
                {SHIFTS.map(([shift]) => (
                  <td key={shift}>
                    <input
                      type="checkbox"
                      name={`w_${d}_${shift}`}
                      defaultChecked={selected.has(`${d}:${shift}`)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">Salvar janelas</button>
      </form>

      <p>
        <Link href="/prof">Voltar</Link>
      </p>
    </main>
  );
}
