-- CreateEnum
CREATE TYPE "ProfessionalProfileState" AS ENUM ('MANAGED', 'INVITED', 'CLAIMED', 'ANONYMIZED', 'MERGED');

-- CreateEnum
CREATE TYPE "WorkRelationshipState" AS ENUM ('ACTIVE', 'PENDING_CONSENT', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "activeCompanyId" TEXT;

-- CreateTable
CREATE TABLE "ProfessionalProfile" (
    "id" TEXT NOT NULL,
    "state" "ProfessionalProfileState" NOT NULL DEFAULT 'MANAGED',
    "fullName" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "email" TEXT,
    "createdByCompanyId" TEXT NOT NULL,
    "sourceNote" TEXT,
    "ownerUserId" TEXT,
    "firstContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkRelationship" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "state" "WorkRelationshipState" NOT NULL DEFAULT 'ACTIVE',
    "roles" TEXT[],
    "privateNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_ownerUserId_key" ON "ProfessionalProfile"("ownerUserId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_phoneE164_idx" ON "ProfessionalProfile"("phoneE164");

-- CreateIndex
CREATE INDEX "WorkRelationship_companyId_idx" ON "WorkRelationship"("companyId");

-- CreateIndex
CREATE INDEX "WorkRelationship_professionalProfileId_idx" ON "WorkRelationship"("professionalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkRelationship_companyId_professionalProfileId_key" ON "WorkRelationship"("companyId", "professionalProfileId");

-- AddForeignKey
ALTER TABLE "WorkRelationship" ADD CONSTRAINT "WorkRelationship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRelationship" ADD CONSTRAINT "WorkRelationship_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
