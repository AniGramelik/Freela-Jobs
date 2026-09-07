import type {
  JobLocationMode,
  JobVinculo,
  PrismaClient,
} from "@prisma/client";

import { haversineKm } from "@/domain/geo";

/** Busca de vagas no mural (ADR-0007, ticket 29). Filtros, sem score (D11). */

export type JobSearchFilters = {
  categorySlug?: string;
  vinculo?: JobVinculo;
  locationMode?: JobLocationMode;
  uf?: string;
  city?: string;
  professionalProfileId?: string;
  now?: Date;
};

export async function searchJobs(
  db: PrismaClient,
  filters: JobSearchFilters,
) {
  const now = filters.now ?? new Date();

  const rows = await db.jobPosting.findMany({
    where: {
      status: "PUBLISHED",
      applicationDeadline: { gt: now },
      ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
      ...(filters.vinculo ? { vinculo: filters.vinculo } : {}),
      ...(filters.locationMode ? { locationMode: filters.locationMode } : {}),
      ...(filters.uf ? { state: filters.uf.toUpperCase() } : {}),
      ...(filters.city
        ? { city: { contains: filters.city, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ featuredUntil: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }],
    take: 100,
    include: { company: { select: { name: true } } },
  });

  const profile = filters.professionalProfileId
    ? await db.professionalProfile.findUnique({
        where: { id: filters.professionalProfileId },
        select: { latitude: true, longitude: true },
      })
    : null;
  const here =
    profile?.latitude != null && profile.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null;

  return rows
    .map((job) => {
      let distanceKm: number | null = null;
      if (
        here &&
        job.locationMode !== "REMOTO" &&
        job.latitude != null &&
        job.longitude != null
      ) {
        distanceKm = Math.round(
          haversineKm(here, { latitude: job.latitude, longitude: job.longitude }),
        );
      }
      return {
        id: job.id,
        title: job.title,
        companyName: job.company.name,
        categorySlug: job.categorySlug,
        vinculo: job.vinculo,
        locationMode: job.locationMode,
        approxLocation:
          [job.city, job.state].filter(Boolean).join("/") ||
          (job.locationMode === "REMOTO" ? "Remoto" : "—"),
        compensationText: job.compensationText,
        positions: job.positions,
        applicationDeadline: job.applicationDeadline,
        featured: job.featuredUntil != null && job.featuredUntil > now,
        distanceKm,
      };
    });
}

export async function getJobDetail(db: PrismaClient, jobId: string) {
  const job = await db.jobPosting.findUnique({
    where: { id: jobId },
    include: { company: { select: { name: true } } },
  });
  if (!job || job.status !== "PUBLISHED") return null;
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    companyName: job.company.name,
    categorySlug: job.categorySlug,
    vinculo: job.vinculo,
    locationMode: job.locationMode,
    approxLocation: [job.city, job.state].filter(Boolean).join("/") || "—",
    compensationText: job.compensationText,
    positions: job.positions,
    applicationDeadline: job.applicationDeadline,
  };
}
