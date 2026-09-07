import Link from "next/link";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { reportContent } from "@/use-cases/moderation";
import {
  invitePublicProfessional,
  searchPublicNetwork,
} from "@/use-cases/public-search";

export const dynamic = "force-dynamic";

export default async function PainelRedePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; msg?: string }>;
}) {
  const { company, user } = await requireCompanyContext();
  const { role, msg } = await searchParams;

  const results = role
    ? await searchPublicNetwork(prisma, { companyId: company.id, role })
    : [];

  async function invite(formData: FormData) {
    "use server";
    const { company: co } = await requireCompanyContext();
    await invitePublicProfessional(prisma, {
      companyId: co.id,
      professionalProfileId: String(formData.get("professionalProfileId")),
    });
    revalidatePath("/painel/rede");
  }

  async function report(formData: FormData) {
    "use server";
    await reportContent(prisma, {
      reporterUserId: user.id,
      targetType: "professional_profile",
      targetId: String(formData.get("professionalProfileId")),
      reason: String(formData.get("reason") ?? "denúncia da rede"),
    });
    revalidatePath("/painel/rede");
  }

  return (
    <main>
      <h1>Buscar na rede local — {company.name}</h1>
      {msg ? <p role="status">{msg}</p> : null}

      <form method="get">
        <label>
          Função <input name="role" type="text" defaultValue={role ?? ""} required />
        </label>{" "}
        <button type="submit">Buscar</button>
      </form>

      {role && results.length === 0 ? (
        <p>Ninguém na rede para essa função por perto.</p>
      ) : (
        <ul>
          {results.map((r) => (
            <li key={r.professionalProfileId}>
              <strong>{r.fullName}</strong> — {r.roles.join(", ")} ·{" "}
              {r.approxLocation}
              {r.distanceKm != null ? ` · ~${r.distanceKm} km` : ""}
              {r.reputation
                ? ` · ${r.reputation.average}★ (${r.reputation.count})`
                : ""}
              {r.phone ? ` · ${r.phone}` : ""}{" "}
              <form action={invite} style={{ display: "inline" }}>
                <input
                  type="hidden"
                  name="professionalProfileId"
                  value={r.professionalProfileId}
                />
                <button type="submit">Convidar</button>
              </form>
              <form action={report} style={{ display: "inline" }}>
                <input
                  type="hidden"
                  name="professionalProfileId"
                  value={r.professionalProfileId}
                />
                <input name="reason" type="text" placeholder="motivo" />
                <button type="submit">Denunciar</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/painel">Voltar</Link>
      </p>
    </main>
  );
}
