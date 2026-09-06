import type { Company, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import { setCompanyPlan } from "./company-plan";
import { StubGeocoder } from "./geocoding";
import {
  cancelJob,
  createJobDraft,
  listCompanyJobs,
  publishJob,
} from "./job-postings";

const db: PrismaClient = getTestDb();
const geocoder = new StubGeocoder();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const future = () => new Date(Date.now() + 7 * 24 * 3_600_000);

async function draft(company: Company, over: Record<string, unknown> = {}) {
  const result = await createJobDraft(db, {
    companyId: company.id,
    title: "Garçom para sábado",
    description: "Evento à noite",
    categorySlug: "garcom",
    vinculo: "DIARIA",
    locationMode: "PRESENCIAL",
    city: "Colatina",
    state: "ES",
    positions: 2,
    applicationDeadline: future(),
    ...over,
  });
  if (!result.ok) throw new Error(`draft: ${result.error}`);
  return result.value.jobId;
}

describe("job postings", () => {
  it("cria rascunho e publica dentro do teto, geocodificando presencial", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const jobId = await draft(co);

    const published = await publishJob(db, geocoder, {
      companyId: co.id,
      jobId,
    });
    expect(published).toEqual({ ok: true, value: { jobId } });

    const job = await db.jobPosting.findUniqueOrThrow({ where: { id: jobId } });
    expect(job.status).toBe("PUBLISHED");
    expect(job.publishedAt).not.toBeNull();
    expect(job.latitude).toBeCloseTo(-19.5386, 3);
  });

  it("bloqueia publicação além do teto do plano FREE", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    await setCompanyPlan(db, { companyId: co.id, tier: "FREE", activeJobLimit: 1 });

    await publishJob(db, geocoder, { companyId: co.id, jobId: await draft(co) });
    const blocked = await publishJob(db, geocoder, {
      companyId: co.id,
      jobId: await draft(co),
    });
    expect(blocked).toEqual({ ok: false, error: "job_limit_reached" });

    await setCompanyPlan(db, { companyId: co.id, tier: "PAID" });
    const afterUpgrade = await publishJob(db, geocoder, {
      companyId: co.id,
      jobId: await draft(co),
    });
    expect(afterUpgrade.ok).toBe(true);
  });

  it("recusa publicar rascunho com prazo no passado", async () => {
    const co = await db.company.create({ data: { name: "Bar" } });
    const jobId = await draft(co, {
      applicationDeadline: new Date(Date.now() - 1000),
    });
    expect(
      await publishJob(db, geocoder, { companyId: co.id, jobId }),
    ).toEqual({ ok: false, error: "deadline_past" });
  });

  it("publicar de novo → not_draft; publicar vaga de outra empresa → not_found", async () => {
    const a = await db.company.create({ data: { name: "A" } });
    const b = await db.company.create({ data: { name: "B" } });
    const jobId = await draft(a);
    await publishJob(db, geocoder, { companyId: a.id, jobId });

    expect(
      await publishJob(db, geocoder, { companyId: a.id, jobId }),
    ).toEqual({ ok: false, error: "not_draft" });
    expect(
      await publishJob(db, geocoder, { companyId: b.id, jobId }),
    ).toEqual({ ok: false, error: "not_found" });
  });

  it("cancela e lista só as vagas da empresa", async () => {
    const a = await db.company.create({ data: { name: "A" } });
    const b = await db.company.create({ data: { name: "B" } });
    const jobId = await draft(a);
    await draft(b);

    expect(await cancelJob(db, { companyId: a.id, jobId })).toEqual({
      ok: true,
      value: { jobId },
    });
    expect(
      (await db.jobPosting.findUniqueOrThrow({ where: { id: jobId } })).status,
    ).toBe("CANCELLED");

    expect(await listCompanyJobs(db, a.id)).toHaveLength(1);
    expect(await listCompanyJobs(db, b.id)).toHaveLength(1);
  });
});
