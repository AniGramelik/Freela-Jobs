import type {
  JobLocationMode,
  JobPosting,
  JobVinculo,
  PrismaClient,
} from "@prisma/client";

import { canPublish } from "@/domain/job-posting";
import { err, ok, type Result } from "@/domain/index";

import { assertCanPublishJob } from "./company-plan";
import type { Geocoder } from "./geocoding";

export type CreateJobDraftInput = {
  companyId: string;
  title: string;
  description: string;
  categorySlug: string;
  vinculo: JobVinculo;
  locationMode: JobLocationMode;
  city?: string | null;
  state?: string | null;
  radiusKm?: number | null;
  compensationText?: string | null;
  positions?: number;
  applicationDeadline: Date;
};

export async function createJobDraft(
  db: PrismaClient,
  input: CreateJobDraftInput,
): Promise<Result<{ jobId: string }, "invalid">> {
  if (!input.title.trim() || !input.description.trim() || !input.categorySlug) {
    return err("invalid");
  }
  if (Number.isNaN(input.applicationDeadline.getTime())) return err("invalid");

  const job = await db.jobPosting.create({
    data: {
      companyId: input.companyId,
      title: input.title.trim(),
      description: input.description.trim(),
      categorySlug: input.categorySlug,
      vinculo: input.vinculo,
      locationMode: input.locationMode,
      city: input.city?.trim() || null,
      state: input.state?.trim().toUpperCase() || null,
      radiusKm:
        input.locationMode === "REMOTO"
          ? null
          : input.radiusKm && input.radiusKm > 0
            ? input.radiusKm
            : 20,
      compensationText: input.compensationText?.trim() || null,
      positions: input.positions && input.positions > 0 ? input.positions : 1,
      applicationDeadline: input.applicationDeadline,
    },
  });
  return ok({ jobId: job.id });
}

export type PublishJobError =
  | "not_found"
  | "not_draft"
  | "missing_fields"
  | "deadline_past"
  | "no_positions"
  | "job_limit_reached";

export async function publishJob(
  db: PrismaClient,
  geocoder: Geocoder,
  params: { companyId: string; jobId: string; now?: Date },
): Promise<Result<{ jobId: string }, PublishJobError>> {
  const now = params.now ?? new Date();
  const job = await db.jobPosting.findUnique({ where: { id: params.jobId } });
  if (!job || job.companyId !== params.companyId) return err("not_found");

  const gate = await assertCanPublishJob(db, params.companyId);
  if (!gate.ok) return err("job_limit_reached");

  const check = canPublish(job, now);
  if (!check.ok) return err(check.error);

  let latitude = job.latitude;
  let longitude = job.longitude;
  if (job.locationMode !== "REMOTO" && job.city && job.state && !latitude) {
    const point = await geocoder
      .geocode(`${job.city} - ${job.state}`)
      .catch(() => null);
    if (point) {
      latitude = point.latitude;
      longitude = point.longitude;
    }
  }

  await db.jobPosting.update({
    where: { id: job.id },
    data: { status: "PUBLISHED", publishedAt: now, latitude, longitude },
  });
  return ok({ jobId: job.id });
}

export async function cancelJob(
  db: PrismaClient,
  params: { companyId: string; jobId: string },
): Promise<Result<{ jobId: string }, "not_found">> {
  const job = await db.jobPosting.findUnique({ where: { id: params.jobId } });
  if (!job || job.companyId !== params.companyId) return err("not_found");
  await db.jobPosting.update({
    where: { id: job.id },
    data: { status: "CANCELLED" },
  });
  // A notificação a candidatos entra com o ticket 31/34.
  return ok({ jobId: job.id });
}

export function listCompanyJobs(
  db: PrismaClient,
  companyId: string,
): Promise<JobPosting[]> {
  return db.jobPosting.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
}
