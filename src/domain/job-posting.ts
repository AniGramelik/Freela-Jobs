import { err, ok, type Result } from "./index";

/** Regras puras da Vaga (ADR-0007). */

export type JobPostingStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED"
  | "CANCELLED"
  | "FILLED";

export type PublishableJob = {
  status: JobPostingStatus;
  title: string;
  description: string;
  categorySlug: string;
  vinculo: string;
  locationMode: string;
  positions: number;
  applicationDeadline: Date;
};

export function canPublish(
  job: PublishableJob,
  now: Date,
): Result<void, "not_draft" | "missing_fields" | "deadline_past" | "no_positions"> {
  if (job.status !== "DRAFT") return err("not_draft");
  if (
    !job.title.trim() ||
    !job.description.trim() ||
    !job.categorySlug ||
    !job.vinculo ||
    !job.locationMode
  ) {
    return err("missing_fields");
  }
  if (job.positions < 1) return err("no_positions");
  if (job.applicationDeadline.getTime() <= now.getTime()) {
    return err("deadline_past");
  }
  return ok(undefined);
}

export function acceptsApplications(
  status: JobPostingStatus,
  applicationDeadline: Date,
  now: Date,
): boolean {
  return status === "PUBLISHED" && applicationDeadline.getTime() > now.getTime();
}

export function statusAfterFill(
  acceptedCount: number,
  positions: number,
): JobPostingStatus {
  return acceptedCount >= positions ? "FILLED" : "PUBLISHED";
}
