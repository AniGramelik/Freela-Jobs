-- CreateEnum
CREATE TYPE "AvailabilityShift" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT');

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "availableNowUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "shift" "AvailabilityShift" NOT NULL,

    CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityWindow_professionalProfileId_idx" ON "AvailabilityWindow"("professionalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityWindow_professionalProfileId_weekday_shift_key" ON "AvailabilityWindow"("professionalProfileId", "weekday", "shift");

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
