-- CreateEnum
CREATE TYPE "ConsentState" AS ENUM ('GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DataSubjectRequestType" AS ENUM ('EXPORT', 'DELETION', 'CORRECTION');

-- CreateEnum
CREATE TYPE "DataSubjectRequestState" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "textVersion" TEXT NOT NULL,
    "state" "ConsentState" NOT NULL,
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSubjectRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DataSubjectRequestType" NOT NULL,
    "state" "DataSubjectRequestState" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consent_subjectType_subjectId_type_idx" ON "Consent"("subjectType", "subjectId", "type");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_userId_idx" ON "DataSubjectRequest"("userId");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_state_idx" ON "DataSubjectRequest"("state");
