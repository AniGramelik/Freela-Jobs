import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Panel } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
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
    <main className="grid gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-[-0.01em] text-fg">
          Rede local
        </h1>
        <StatusPill tone={active ? "pos" : "neutral"}>
          {active ? "visível" : "fora da rede"}
        </StatusPill>
      </div>

      <form action={save}>
        <Panel className="grid gap-4">
          <Field
            label="Funções que aparecem"
            htmlFor="roles"
            hint="separadas por vírgula"
          >
            <Input
              id="roles"
              name="roles"
              defaultValue={listing?.roles.join(", ") ?? ""}
              placeholder="garçom, apoio"
            />
          </Field>
          <Field label="Raio de atendimento (km)" htmlFor="radiusKm">
            <Input
              id="radiusKm"
              name="radiusKm"
              type="number"
              min={1}
              defaultValue={listing?.radiusKm ?? 30}
              className="tnum"
            />
          </Field>
          <label className="flex items-center gap-2.5 text-[0.875rem] text-fg">
            <input
              type="checkbox"
              name="showPhone"
              defaultChecked={listing?.showPhone ?? false}
              className="size-4 accent-[var(--color-brand)]"
            />
            Mostrar meu telefone para empresas
          </label>
          <Button type="submit" className="h-10">
            {active ? "Atualizar" : "Entrar na rede"}
          </Button>
        </Panel>
      </form>

      {active ? (
        <Panel className="grid gap-2">
          <form action={toggleReputation}>
            <input
              type="hidden"
              name="on"
              value={listing?.showReputation ? "0" : "1"}
            />
            <Button type="submit" variant="secondary" size="sm">
              {listing?.showReputation
                ? "Ocultar minha reputação"
                : "Exibir reputação (média, sem comentários)"}
            </Button>
          </form>
          <form action={stop}>
            <Button type="submit" variant="ghost" size="sm">
              Sair da rede
            </Button>
          </form>
        </Panel>
      ) : null}
    </main>
  );
}
