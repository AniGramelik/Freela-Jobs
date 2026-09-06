import Link from "next/link";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  archiveRelationship,
  listMyRelationships,
  respondToRelationship,
} from "@/use-cases/my-relationships";

export const dynamic = "force-dynamic";

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
    <main>
      <h1>Meus vínculos</h1>
      {relationships.length === 0 ? (
        <p>Nenhuma empresa ainda.</p>
      ) : (
        <ul>
          {relationships.map((r) => (
            <li key={r.relationshipId}>
              <strong>{r.companyName}</strong> — {r.state}
              {r.roles.length > 0 ? ` · ${r.roles.join(", ")}` : ""}{" "}
              {r.state === "PENDING_CONSENT" ? (
                <>
                  <form action={respond} style={{ display: "inline" }}>
                    <input type="hidden" name="relationshipId" value={r.relationshipId} />
                    <input type="hidden" name="action" value="accept" />
                    <button type="submit">Aceitar</button>
                  </form>
                  <form action={respond} style={{ display: "inline" }}>
                    <input type="hidden" name="relationshipId" value={r.relationshipId} />
                    <input type="hidden" name="action" value="decline" />
                    <button type="submit">Recusar</button>
                  </form>
                </>
              ) : r.state === "ACTIVE" ? (
                <form action={archive} style={{ display: "inline" }}>
                  <input type="hidden" name="relationshipId" value={r.relationshipId} />
                  <button type="submit">Arquivar</button>
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
