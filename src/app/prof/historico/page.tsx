import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { getMyWorkHistory } from "@/use-cases/attendance";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const { professionalProfileId } = await requireProfessional();
  const history = await getMyWorkHistory(prisma, { professionalProfileId });

  return (
    <main>
      <h1>Meu histórico</h1>
      {history.length === 0 ? (
        <p>Nada registrado ainda.</p>
      ) : (
        <ul>
          {history.map((h) => (
            <li key={h.id}>
              {h.callOut.company.name} — {h.callOut.role} ·{" "}
              {h.callOut.shiftDate.toLocaleDateString("pt-BR")} · {h.state}
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
