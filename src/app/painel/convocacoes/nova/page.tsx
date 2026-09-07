import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listCompanyProfessionals } from "@/use-cases/professionals";

import { NovaConvocacaoForm } from "./NovaConvocacaoForm";

export const dynamic = "force-dynamic";

export default async function NovaConvocacaoPage() {
  const { company } = await requireCompanyContext();
  const people = await listCompanyProfessionals(prisma, {
    companyId: company.id,
  });

  return (
    <NovaConvocacaoForm
      targets={people
        .filter((p) => p.relationshipState === "ACTIVE")
        .map((p) => ({
          profileId: p.profileId,
          fullName: p.fullName,
          roles: p.roles,
        }))}
    />
  );
}
