-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'DEAD');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED', 'OPENED');

-- CreateTable
CREATE TABLE "OutboxMessage" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "claimId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "outboxId" TEXT,
    "recipient" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "providerId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationOptOut" (
    "subjectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationOptOut_pkey" PRIMARY KEY ("subjectId","category")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutboxMessage_dedupeKey_key" ON "OutboxMessage"("dedupeKey");

-- CreateIndex
CREATE INDEX "OutboxMessage_status_nextRetryAt_idx" ON "OutboxMessage"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "NotificationLog_recipient_idx" ON "NotificationLog"("recipient");

-- CreateIndex
CREATE INDEX "NotificationLog_outboxId_idx" ON "NotificationLog"("outboxId");
