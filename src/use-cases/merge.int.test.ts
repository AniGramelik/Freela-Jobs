import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { InMemoryAuditRecorder } from "./audit";
import { mergeDuplicateProfiles, resolveProfileId } from "./merge";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

describe("mergeDuplicateProfiles", () => {
  it("funde duplicados por telefone, consolidando vínculos e removendo sobreposição", async () => {
    const shared = await db.company.create({ data: { name: "Compartilhada" } });
    const onlyDup = await db.company.create({ data: { name: "Só da dup" } });

    const canonical = await db.professionalProfile.create({
      data: {
        fullName: "Ana",
        phoneE164: "+5527999123456",
        createdByCompanyId: shared.id,
        state: "CLAIMED",
      },
    });
    const dup = await db.professionalProfile.create({
      data: {
        fullName: "Ana (dup)",
        phoneE164: "+5527999123456",
        createdByCompanyId: onlyDup.id,
        state: "MANAGED",
      },
    });

    await db.workRelationship.createMany({
      data: [
        { companyId: shared.id, professionalProfileId: canonical.id },
        { companyId: shared.id, professionalProfileId: dup.id }, // sobreposição
        { companyId: onlyDup.id, professionalProfileId: dup.id },
      ],
    });

    const audit = new InMemoryAuditRecorder();
    const result = await mergeDuplicateProfiles(db, audit, {
      canonicalId: canonical.id,
    });

    expect(result.mergedCount).toBe(1);
    const merged = await db.professionalProfile.findUniqueOrThrow({
      where: { id: dup.id },
    });
    expect(merged.state).toBe("MERGED");
    expect(merged.mergedIntoId).toBe(canonical.id);

    const rels = await db.workRelationship.findMany({
      where: { professionalProfileId: canonical.id },
      select: { companyId: true },
    });
    expect(rels.map((r) => r.companyId).sort()).toEqual(
      [shared.id, onlyDup.id].sort(),
    );
    expect(
      await db.workRelationship.count({
        where: { professionalProfileId: dup.id },
      }),
    ).toBe(0);

    expect(audit.entries[0]?.action).toBe("profile.merged");
    expect(await resolveProfileId(db, dup.id)).toBe(canonical.id);
  });

  it("sem duplicados, não faz nada", async () => {
    const co = await db.company.create({ data: { name: "X" } });
    const p = await db.professionalProfile.create({
      data: {
        fullName: "Solo",
        phoneE164: "+5527999000000",
        createdByCompanyId: co.id,
        state: "CLAIMED",
      },
    });
    expect(
      await mergeDuplicateProfiles(db, new InMemoryAuditRecorder(), {
        canonicalId: p.id,
      }),
    ).toEqual({ mergedCount: 0 });
  });
});
