-- CreateEnum
CREATE TYPE "CallOutMode" AS ENUM ('TARGETED', 'OPEN');

-- CreateEnum
CREATE TYPE "CallOutStatus" AS ENUM ('DRAFT', 'OPEN', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallOutResponseState" AS ENUM ('OFFERED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'NO_SHOW', 'COMPLETED');

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "baseCity" TEXT,
ADD COLUMN     "baseState" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CallOut" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mode" "CallOutMode" NOT NULL,
    "role" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "shiftStart" TEXT NOT NULL,
    "shiftEnd" TEXT,
    "location" TEXT NOT NULL,
    "compensationText" TEXT,
    "notes" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "radiusKm" INTEGER,
    "status" "CallOutStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallOutResponse" (
    "id" TEXT NOT NULL,
    "callOutId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "state" "CallOutResponseState" NOT NULL DEFAULT 'OFFERED',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallOutResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalRating" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "callOutId" TEXT,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallOut_companyId_status_idx" ON "CallOut"("companyId", "status");

-- CreateIndex
CREATE INDEX "CallOut_status_shiftDate_idx" ON "CallOut"("status", "shiftDate");

-- CreateIndex
CREATE INDEX "CallOutResponse_professionalProfileId_idx" ON "CallOutResponse"("professionalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CallOutResponse_callOutId_professionalProfileId_key" ON "CallOutResponse"("callOutId", "professionalProfileId");

-- CreateIndex
CREATE INDEX "InternalRating_companyId_professionalProfileId_idx" ON "InternalRating"("companyId", "professionalProfileId");

-- CreateIndex
CREATE INDEX "InternalRating_professionalProfileId_idx" ON "InternalRating"("professionalProfileId");

-- AddForeignKey
ALTER TABLE "CallOut" ADD CONSTRAINT "CallOut_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallOutResponse" ADD CONSTRAINT "CallOutResponse_callOutId_fkey" FOREIGN KEY ("callOutId") REFERENCES "CallOut"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallOutResponse" ADD CONSTRAINT "CallOutResponse_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalRating" ADD CONSTRAINT "InternalRating_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
