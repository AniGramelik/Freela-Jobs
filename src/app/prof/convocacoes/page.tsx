import Link from "next/link";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { respondToCallOut } from "@/use-cases/callouts";

export const dynamic = "force-dynamic";

export default async function ProfConvocacoesPage() {
  const { professionalProfileId } = await requireProfessional();

  const responses = await prisma.callOutResponse.findMany({
    where: {
      professionalProfileId,
      state: { in: ["OFFERED", "ACCEPTED"] },
      callOut: { status: { in: ["OPEN", "FILLED"] } },
    },
    include: {
      callOut: {
        select: {
          id: true,
          role: true,
          shiftDate: true,
          shiftStart: true,
          location: true,
          compensationText: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function respond(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await respondToCallOut(prisma, {
      callOutId: String(formData.get("callOutId")),
      professionalProfileId: pid,
      action: formData.get("action") as "accept" | "decline" | "withdraw",
    });
    revalidatePath("/prof/convocacoes");
  }

  return (
    <main>
      <h1>Convocações</h1>
      {responses.length === 0 ? (
        <p>Nenhuma convocação no momento.</p>
      ) : (
        <ul>
          {responses.map((r) => (
            <li key={r.id}>
              <strong>{r.callOut.company.name}</strong> — {r.callOut.role} ·{" "}
              {r.callOut.shiftDate.toLocaleDateString("pt-BR")}{" "}
              {r.callOut.shiftStart} · {r.callOut.location}
              {r.callOut.compensationText
                ? ` · ${r.callOut.compensationText}`
                : ""}{" "}
              [{r.state}]{" "}
              {r.state === "OFFERED" ? (
                <>
                  <form action={respond} style={{ display: "inline" }}>
                    <input type="hidden" name="callOutId" value={r.callOut.id} />
                    <input type="hidden" name="action" value="accept" />
                    <button type="submit">Topar</button>
                  </form>
                  <form action={respond} style={{ display: "inline" }}>
                    <input type="hidden" name="callOutId" value={r.callOut.id} />
                    <input type="hidden" name="action" value="decline" />
                    <button type="submit">Recusar</button>
                  </form>
                </>
              ) : (
                <form action={respond} style={{ display: "inline" }}>
                  <input type="hidden" name="callOutId" value={r.callOut.id} />
                  <input type="hidden" name="action" value="withdraw" />
                  <button type="submit">Desistir</button>
                </form>
              )}
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
