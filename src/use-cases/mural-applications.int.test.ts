import type { Company, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  applyToJob,
  listJobApplications,
  makeOffer,
  respondToOffer,
  screenApplication,
  withdrawApplication,
} from "./applications";
import { InMemoryAuditRecorder } from "./audit";
import { StubGeocoder } from "./geocoding";
import { createJobDraft, featureJob, publishJob } from "./job-postings";
import { searchJobs } from "./job-search";
import { removeJob } from "./moderation";
import { runRetention } from "./retention";

const db: PrismaClient = getTestDb();
const geocoder = new StubGeocoder();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const future = () => new Date(Date.now() + 10 * 86_400_000);

async function publishedJob(company: Company, over: Record<string, unknown> = {}) {
  const draft = await createJobDraft(db, {
    companyId: company.id,
    title: "Garçom para o fim de semana",
    description: "Turnos noturnos",
    categorySlug: "garcom",
    vinculo: "DIARIA",
    locationMode: "PRESENCIAL",
    city: "Colatina",
    state: "ES",
    positions: 1,
    applicationDeadline: future(),
    ...over,
  });
  if (!draft.ok) throw new Error(`draft: ${draft.error}`);
  const pub = await publishJob(db, geocoder, {
    companyId: company.id,
    jobId: draft.value.jobId,
  });
  if (!pub.ok) throw new Error(`publish: ${pub.error}`);
  return draft.value.jobId;
}

async function claimedProfile(name: string) {
  const co = await db.company.create({ data: { name: `dono-${name}` } });
  return db.professionalProfile.create({
    data: {
      fullName: name,
      phoneE164: `+55279${Math.floor(Math.random() * 1e8)}`,
      createdByCompanyId: co.id,
      state: "CLAIMED",
    },
  });
}

describe("busca de vagas (ticket 29)", () => {
  it("lista PUBLISHED no prazo, com destaque primeiro", async () => {
    const co = await db.company.create({ data: { name: "Buffet" } });
    const jNormal = await publishedJob(co, { title: "Comum" });
    const jFeat = await publishedJob(co, { title: "Destaque" });
    await featureJob(db, { companyId: co.id, jobId: jFeat, days: 7 });

    const results = await searchJobs(db, { categorySlug: "garcom" });
    expect(results).toHaveLength(2);
    expect(results[0]?.title).toBe("Destaque");
    expect(results[0]?.featured).toBe(true);

    // vaga com prazo vencido não aparece
    await db.jobPosting.update({
      where: { id: jNormal },
      data: { applicationDeadline: new Date(Date.now() - 1000) },
    });
    expect(await searchJobs(db, { categorySlug: "garcom" })).toHaveLength(1);
  });
});

describe("candidatura → triagem → oferta → vínculo (30, 31, 32)", () => {
  it("percorre o funil e cria WorkRelationship PENDING_CONSENT ao aceitar", async () => {
    const co = await db.company.create({ data: { name: "Buffet" } });
    const jobId = await publishedJob(co);
    const p = await claimedProfile("João");

    const applied = await applyToJob(db, {
      jobPostingId: jobId,
      professionalProfileId: p.id,
      coverMessage: "tenho experiência",
    });
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;

    expect(
      await db.outboxMessage.count({
        where: { dedupeKey: { startsWith: "application-received:" } },
      }),
    ).toBe(1);

    // candidatura duplicada é barrada
    expect(
      await applyToJob(db, { jobPostingId: jobId, professionalProfileId: p.id }),
    ).toEqual({ ok: false, error: "already_applied" });

    await screenApplication(db, {
      companyId: co.id,
      applicationId: applied.value.applicationId,
      to: "UNDER_REVIEW",
    });
    await screenApplication(db, {
      companyId: co.id,
      applicationId: applied.value.applicationId,
      to: "SHORTLISTED",
    });
    // pular etapa é inválido
    expect(
      await screenApplication(db, {
        companyId: co.id,
        applicationId: applied.value.applicationId,
        to: "UNDER_REVIEW",
      }),
    ).toEqual({ ok: false, error: "invalid_transition" });

    const offer = await makeOffer(db, {
      companyId: co.id,
      applicationId: applied.value.applicationId,
    });
    expect(offer).toEqual({ ok: true, value: { state: "OFFERED" } });

    const accepted = await respondToOffer(db, {
      professionalProfileId: p.id,
      applicationId: applied.value.applicationId,
      action: "accept",
    });
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.value.jobFilled).toBe(true);

    expect(
      (await db.jobPosting.findUniqueOrThrow({ where: { id: jobId } })).status,
    ).toBe("FILLED");
    expect(
      (
        await db.workRelationship.findUniqueOrThrow({
          where: { id: accepted.value.relationshipId! },
        })
      ).state,
    ).toBe("PENDING_CONSENT");
  });

  it("exige perfil CLAIMED e vaga aberta; permite retirar", async () => {
    const co = await db.company.create({ data: { name: "X" } });
    const jobId = await publishedJob(co);
    const managed = await db.professionalProfile.create({
      data: {
        fullName: "Gerenciado",
        phoneE164: "+5527990000001",
        createdByCompanyId: co.id,
        state: "MANAGED",
      },
    });
    expect(
      await applyToJob(db, {
        jobPostingId: jobId,
        professionalProfileId: managed.id,
      }),
    ).toEqual({ ok: false, error: "profile_not_claimed" });

    const p = await claimedProfile("Ana");
    const a = await applyToJob(db, {
      jobPostingId: jobId,
      professionalProfileId: p.id,
    });
    if (!a.ok) throw new Error("setup");
    expect(
      await withdrawApplication(db, {
        applicationId: a.value.applicationId,
        professionalProfileId: p.id,
      }),
    ).toEqual({ ok: true, value: undefined });
  });

  it("empresa de fora não faz triagem", async () => {
    const co = await db.company.create({ data: { name: "X" } });
    const other = await db.company.create({ data: { name: "Y" } });
    const jobId = await publishedJob(co);
    const p = await claimedProfile("Zé");
    const a = await applyToJob(db, {
      jobPostingId: jobId,
      professionalProfileId: p.id,
    });
    if (!a.ok) throw new Error("setup");
    expect(
      await screenApplication(db, {
        companyId: other.id,
        applicationId: a.value.applicationId,
        to: "UNDER_REVIEW",
      }),
    ).toEqual({ ok: false, error: "not_found" });
  });
});

describe("moderação de vaga (ticket 34)", () => {
  it("remove a vaga e encerra as candidaturas abertas", async () => {
    const co = await db.company.create({ data: { name: "X" } });
    const jobId = await publishedJob(co);
    const p = await claimedProfile("João");
    const a = await applyToJob(db, {
      jobPostingId: jobId,
      professionalProfileId: p.id,
    });
    if (!a.ok) throw new Error("setup");

    const audit = new InMemoryAuditRecorder();
    await removeJob(db, audit, {
      supportUserId: "s1",
      jobId,
      reason: "vaga enganosa",
    });

    expect(
      (await db.jobPosting.findUniqueOrThrow({ where: { id: jobId } })).status,
    ).toBe("CANCELLED");
    expect(
      (
        await db.application.findUniqueOrThrow({
          where: { id: a.value.applicationId },
        })
      ).state,
    ).toBe("REJECTED");
    expect(audit.entries[0]?.action).toBe("job_posting.removed");
  });
});

describe("retenção de anexos (ticket 35)", () => {
  it("limpa currículo/carta de candidaturas em vagas encerradas há +1 ano", async () => {
    const co = await db.company.create({ data: { name: "X" } });
    const jobId = await publishedJob(co);
    const p = await claimedProfile("João");
    await applyToJob(db, {
      jobPostingId: jobId,
      professionalProfileId: p.id,
      coverMessage: "carta",
      resumeUrl: "http://cv",
    });
    await db.jobPosting.update({
      where: { id: jobId },
      data: {
        status: "CLOSED",
        updatedAt: new Date(Date.now() - 400 * 86_400_000),
      },
    });

    const dry = await runRetention(db, { dryRun: true });
    expect(dry.applicationAttachmentsCleared).toBe(1);

    await runRetention(db, { dryRun: false });
    const app = await db.application.findFirstOrThrow();
    expect(app.resumeUrl).toBeNull();
    expect(app.coverMessage).toBeNull();
  });
});
