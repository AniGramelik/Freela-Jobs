import Link from "next/link";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  listMyApplications,
  respondToOffer,
  withdrawApplication,
} from "@/use-cases/applications";

export const dynamic = "force-dynamic";

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
    <main>
      <h1>Minhas candidaturas</h1>
      {apps.length === 0 ? (
        <p>Nenhuma candidatura.</p>
      ) : (
        <ul>
          {apps.map((a) => (
            <li key={a.id}>
              <strong>{a.jobPosting.title}</strong> — {a.jobPosting.company.name}{" "}
              · <em>{a.state}</em>{" "}
              {a.state === "OFFERED" ? (
                <>
                  <form action={offerResponse} style={{ display: "inline" }}>
                    <input type="hidden" name="applicationId" value={a.id} />
                    <input type="hidden" name="action" value="accept" />
                    <button type="submit">Aceitar oferta</button>
                  </form>
                  <form action={offerResponse} style={{ display: "inline" }}>
                    <input type="hidden" name="applicationId" value={a.id} />
                    <input type="hidden" name="action" value="decline" />
                    <button type="submit">Recusar</button>
                  </form>
                </>
              ) : ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED"].includes(
                  a.state,
                ) ? (
                <form action={withdraw} style={{ display: "inline" }}>
                  <input type="hidden" name="applicationId" value={a.id} />
                  <button type="submit">Retirar</button>
                </form>
              ) : null}
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
