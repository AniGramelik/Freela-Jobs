import type { ApplicationState, PrismaClient } from "@prisma/client";

import { acceptsApplications } from "@/domain/job-posting";
import {
  canRespondToOffer,
  canScreen,
  canWithdraw,
} from "@/domain/application";
import { err, ok, type Result } from "@/domain/index";

import { enqueueOutbox } from "./outbox";

/** Candidatura, triagem e oferta (ADR-0007, tickets 30, 31, 32). */

export async function applyToJob(
  db: PrismaClient,
  params: {
    jobPostingId: string;
    professionalProfileId: string;
    coverMessage?: string | null;
    resumeUrl?: string | null;
    now?: Date;
  },
): Promise<
  Result<
    { applicationId: string },
    "job_unavailable" | "profile_not_claimed" | "already_applied"
  >
> {
  const now = params.now ?? new Date();
  const [job, profile] = await Promise.all([
    db.jobPosting.findUnique({ where: { id: params.jobPostingId } }),
    db.professionalProfile.findUnique({
      where: { id: params.professionalProfileId },
      select: { state: true },
    }),
  ]);
  if (!job || !acceptsApplications(job.status, job.applicationDeadline, now)) {
    return err("job_unavailable");
  }
  if (profile?.state !== "CLAIMED") return err("profile_not_claimed");

  const existing = await db.application.findUnique({
    where: {
      jobPostingId_professionalProfileId: {
        jobPostingId: params.jobPostingId,
        professionalProfileId: params.professionalProfileId,
      },
    },
  });
  if (existing) return err("already_applied");

  const application = await db.$transaction(async (tx) => {
    const created = await tx.application.create({
      data: {
        jobPostingId: params.jobPostingId,
        professionalProfileId: params.professionalProfileId,
        coverMessage: params.coverMessage?.trim() || null,
        resumeUrl: params.resumeUrl?.trim() || null,
      },
    });
    await enqueueOutbox(tx, {
      topic: "notification",
      dedupeKey: `application-received:${created.id}`,
      payload: {
        notifications: [
          {
            recipient: `company:${job.companyId}`,
            channel: "EMAIL",
            category: "application_received",
            template: "application_received",
            data: { jobPostingId: job.id, applicationId: created.id },
          },
        ],
      },
    });
    return created;
  });

  return ok({ applicationId: application.id });
}

export async function withdrawApplication(
  db: PrismaClient,
  params: { applicationId: string; professionalProfileId: string },
): Promise<Result<void, "not_found" | "invalid_state">> {
  const app = await db.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.professionalProfileId !== params.professionalProfileId) {
    return err("not_found");
  }
  if (!canWithdraw(app.state)) return err("invalid_state");
  await db.application.update({
    where: { id: app.id },
    data: { state: "WITHDRAWN" },
  });
  return ok(undefined);
}

export function listMyApplications(
  db: PrismaClient,
  params: { professionalProfileId: string },
) {
  return db.application.findMany({
    where: { professionalProfileId: params.professionalProfileId },
    include: {
      jobPosting: {
        select: { title: true, company: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function listJobApplications(
  db: PrismaClient,
  params: { companyId: string; jobPostingId: string },
) {
  return db.application.findMany({
    where: {
      jobPostingId: params.jobPostingId,
      jobPosting: { companyId: params.companyId },
    },
    include: {
      professionalProfile: {
        select: { id: true, fullName: true, phoneE164: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function notifyApplicant(
  db: PrismaClient,
  applicationId: string,
  professionalProfileId: string,
  newState: string,
): Promise<void> {
  await enqueueOutbox(db, {
    topic: "notification",
    dedupeKey: `application-status:${applicationId}:${newState}`,
    payload: {
      subjectId: professionalProfileId,
      notifications: [
        {
          recipient: `profile:${professionalProfileId}`,
          channel: "EMAIL",
          category: "application_status",
          template: "application_status",
          data: { applicationId, state: newState },
        },
      ],
    },
  });
}

export async function screenApplication(
  db: PrismaClient,
  params: {
    companyId: string;
    applicationId: string;
    to: "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED";
  },
): Promise<Result<{ state: ApplicationState }, "not_found" | "invalid_transition">> {
  const app = await db.application.findUnique({
    where: { id: params.applicationId },
    include: { jobPosting: { select: { companyId: true } } },
  });
  if (!app || app.jobPosting.companyId !== params.companyId) {
    return err("not_found");
  }
  if (!canScreen(app.state, params.to)) return err("invalid_transition");

  await db.application.update({
    where: { id: app.id },
    data: { state: params.to },
  });
  await notifyApplicant(db, app.id, app.professionalProfileId, params.to);
  return ok({ state: params.to });
}

export async function makeOffer(
  db: PrismaClient,
  params: { companyId: string; applicationId: string },
): Promise<Result<{ state: ApplicationState }, "not_found" | "invalid_transition">> {
  const app = await db.application.findUnique({
    where: { id: params.applicationId },
    include: { jobPosting: { select: { companyId: true } } },
  });
  if (!app || app.jobPosting.companyId !== params.companyId) {
    return err("not_found");
  }
  if (!canScreen(app.state, "OFFERED")) return err("invalid_transition");

  await db.application.update({
    where: { id: app.id },
    data: { state: "OFFERED" },
  });
  await notifyApplicant(db, app.id, app.professionalProfileId, "OFFERED");
  return ok({ state: "OFFERED" });
}

export async function respondToOffer(
  db: PrismaClient,
  params: {
    professionalProfileId: string;
    applicationId: string;
    action: "accept" | "decline";
  },
): Promise<
  Result<
    { state: ApplicationState; jobFilled: boolean; relationshipId?: string },
    "not_found" | "invalid_state" | "job_full"
  >
> {
  return db.$transaction(async (tx) => {
    const app = await tx.application.findUnique({
      where: { id: params.applicationId },
      include: { jobPosting: true },
    });
    if (!app || app.professionalProfileId !== params.professionalProfileId) {
      return err("not_found" as const);
    }
    if (!canRespondToOffer(app.state)) return err("invalid_state" as const);

    if (params.action === "decline") {
      await tx.application.update({
        where: { id: app.id },
        data: { state: "WITHDRAWN" },
      });
      return ok({ state: "WITHDRAWN" as ApplicationState, jobFilled: false });
    }

    const acceptedCount = await tx.application.count({
      where: { jobPostingId: app.jobPostingId, state: "ACCEPTED" },
    });
    if (acceptedCount >= app.jobPosting.positions) {
      return err("job_full" as const);
    }

    await tx.application.update({
      where: { id: app.id },
      data: { state: "ACCEPTED" },
    });

    const filled = acceptedCount + 1 >= app.jobPosting.positions;
    if (filled) {
      await tx.jobPosting.update({
        where: { id: app.jobPostingId },
        data: { status: "FILLED" },
      });
    }

    // Cria o vínculo pendente de consentimento (mesmo mecanismo do claim).
    const existing = await tx.workRelationship.findUnique({
      where: {
        companyId_professionalProfileId: {
          companyId: app.jobPosting.companyId,
          professionalProfileId: params.professionalProfileId,
        },
      },
    });
    const relationship =
      existing ??
      (await tx.workRelationship.create({
        data: {
          companyId: app.jobPosting.companyId,
          professionalProfileId: params.professionalProfileId,
          state: "PENDING_CONSENT",
        },
      }));

    return ok({
      state: "ACCEPTED" as ApplicationState,
      jobFilled: filled,
      relationshipId: relationship.id,
    });
  });
}
