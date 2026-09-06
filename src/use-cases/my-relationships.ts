import type { PrismaClient, WorkRelationshipState } from "@prisma/client";

import { err, ok, type Result } from "@/domain/index";

export type MyRelationship = {
  relationshipId: string;
  companyId: string;
  companyName: string;
  state: WorkRelationshipState;
  roles: string[];
  createdAt: Date;
};

/** Vínculos do profissional. Nunca inclui a nota privada da empresa. */
export async function listMyRelationships(
  db: PrismaClient,
  params: { professionalProfileId: string },
): Promise<MyRelationship[]> {
  const rows = await db.workRelationship.findMany({
    where: { professionalProfileId: params.professionalProfileId },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    relationshipId: r.id,
    companyId: r.company.id,
    companyName: r.company.name,
    state: r.state,
    roles: r.roles,
    createdAt: r.createdAt,
  }));
}

export async function respondToRelationship(
  db: PrismaClient,
  params: {
    professionalProfileId: string;
    relationshipId: string;
    action: "accept" | "decline";
  },
): Promise<Result<{ state: WorkRelationshipState | "REMOVED" }, "not_found" | "not_pending">> {
  const rel = await db.workRelationship.findUnique({
    where: { id: params.relationshipId },
  });
  if (!rel || rel.professionalProfileId !== params.professionalProfileId) {
    return err("not_found");
  }
  if (rel.state !== "PENDING_CONSENT") return err("not_pending");

  if (params.action === "accept") {
    await db.workRelationship.update({
      where: { id: rel.id },
      data: { state: "ACTIVE" },
    });
    return ok({ state: "ACTIVE" });
  }
  await db.workRelationship.delete({ where: { id: rel.id } });
  return ok({ state: "REMOVED" });
}

export async function archiveRelationship(
  db: PrismaClient,
  params: { professionalProfileId: string; relationshipId: string },
): Promise<Result<{ relationshipId: string }, "not_found">> {
  const rel = await db.workRelationship.findUnique({
    where: { id: params.relationshipId },
  });
  if (!rel || rel.professionalProfileId !== params.professionalProfileId) {
    return err("not_found");
  }
  await db.workRelationship.update({
    where: { id: rel.id },
    data: { state: "ARCHIVED" },
  });
  return ok({ relationshipId: rel.id });
}
