import Link from "next/link";
import { revalidatePath } from "next/cache";

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
    prisma.notificationOptOut.findMany({ where: { subjectId: professionalProfileId } }),
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
    <main>
      <h1>Meus dados</h1>

      <h2>Preferências de notificação</h2>
      <p>Convocações e avisos essenciais não podem ser desligados.</p>
      {OPTIONAL_CATEGORIES.map(([cat, label]) => {
        const off = optedOut.has(cat);
        return (
          <form key={cat} action={togglePref}>
            <input type="hidden" name="category" value={cat} />
            <input type="hidden" name="optOut" value={off ? "0" : "1"} />
            <label>
              {label}: <strong>{off ? "desligado" : "ligado"}</strong>
            </label>{" "}
            <button type="submit">{off ? "Ligar" : "Desligar"}</button>
          </form>
        );
      })}

      <h2>Exportar meus dados</h2>
      <pre
        style={{ maxHeight: 240, overflow: "auto", background: "#f4f4f4" }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>

      <h2>Excluir minha conta</h2>
      <form action={askDeletion}>
        <p>
          Isso remove seus dados pessoais. O histórico de trabalho fica de forma
          pseudonimizada, pela necessidade legítima das empresas.
        </p>
        <button type="submit">Solicitar exclusão</button>
      </form>

      <p>
        <Link href="/prof">Voltar</Link>
      </p>
    </main>
  );
}
