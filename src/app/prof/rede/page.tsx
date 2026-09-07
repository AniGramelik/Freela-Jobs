import Link from "next/link";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  getPublicListing,
  revokePublicVisibility,
  setPublicReputationOptIn,
  setPublicVisibility,
} from "@/use-cases/public-listing";

export const dynamic = "force-dynamic";

export default async function ProfRedePage() {
  const { professionalProfileId } = await requireProfessional();
  const listing = await getPublicListing(prisma, professionalProfileId);
  const active = listing?.active ?? false;

  async function save(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await setPublicVisibility(prisma, {
      professionalProfileId: pid,
      roles: String(formData.get("roles") ?? "").split(","),
      radiusKm: Number(formData.get("radiusKm") ?? 30),
      showPhone: formData.get("showPhone") === "on",
    });
    revalidatePath("/prof/rede");
  }

  async function stop() {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await revokePublicVisibility(prisma, { professionalProfileId: pid });
    revalidatePath("/prof/rede");
  }

  async function toggleReputation(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await setPublicReputationOptIn(prisma, {
      professionalProfileId: pid,
      on: formData.get("on") === "1",
    });
    revalidatePath("/prof/rede");
  }

  return (
    <main>
      <h1>Rede local</h1>
      <p>
        Status: <strong>{active ? "visível" : "fora da rede"}</strong>
      </p>

      <form action={save}>
        <p>
          <label>
            Funções que aparecem (vírgula){" "}
            <input
              name="roles"
              type="text"
              defaultValue={listing?.roles.join(", ") ?? ""}
              placeholder="garçom, apoio"
            />
          </label>
        </p>
        <p>
          <label>
            Raio de atendimento (km){" "}
            <input
              name="radiusKm"
              type="number"
              min={1}
              defaultValue={listing?.radiusKm ?? 30}
            />
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              name="showPhone"
              defaultChecked={listing?.showPhone ?? false}
            />{" "}
            Mostrar meu telefone para empresas
          </label>
        </p>
        <button type="submit">{active ? "Atualizar" : "Entrar na rede"}</button>
      </form>

      {active ? (
        <>
          <form action={toggleReputation}>
            <input
              type="hidden"
              name="on"
              value={listing?.showReputation ? "0" : "1"}
            />
            <button type="submit">
              {listing?.showReputation
                ? "Ocultar minha reputação"
                : "Exibir reputação (média, sem comentários)"}
            </button>
          </form>
          <form action={stop}>
            <button type="submit">Sair da rede</button>
          </form>
        </>
      ) : null}

      <p>
        <Link href="/prof">Voltar</Link>
      </p>
    </main>
  );
}
