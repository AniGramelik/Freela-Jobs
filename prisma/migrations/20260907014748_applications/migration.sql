-- CreateEnum
CREATE TYPE "ApplicationState" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "coverMessage" TEXT,
    "resumeUrl" TEXT,
    "state" "ApplicationState" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_professionalProfileId_idx" ON "Application"("professionalProfileId");

-- CreateIndex
CREATE INDEX "Application_jobPostingId_state_idx" ON "Application"("jobPostingId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobPostingId_professionalProfileId_key" ON "Application"("jobPostingId", "professionalProfileId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
