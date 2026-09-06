import { Prisma, type PrismaClient } from "@prisma/client";

import {
  canSend,
  outboxStateAfterFailure,
  retryDelayMs,
} from "@/domain/notifications";
import { logger } from "@/lib/logger";

import type { DbClient } from "./db";
import type { Notifier, OutboundNotification } from "./notifier";

/**
 * Payload do tópico "notification": uma ou mais notificações a despachar,
 * mais o `subjectId` (id lógico do destinatário) para checar opt-out.
 */
export type NotificationOutboxPayload = {
  subjectId?: string;
  notifications: OutboundNotification[];
};

export type EnqueueInput = {
  topic: string;
  payload: NotificationOutboxPayload | Record<string, unknown>;
  dedupeKey: string;
};

/**
 * Grava a intenção de efeito colateral. Deve rodar na MESMA transação da
 * escrita de negócio. Idempotente por `dedupeKey`: reenfileirar a mesma chave
 * não cria uma segunda mensagem.
 */
export async function enqueueOutbox(
  db: DbClient,
  input: EnqueueInput,
): Promise<{ enqueued: boolean }> {
  try {
    await db.outboxMessage.create({
      data: {
        topic: input.topic,
        payload: input.payload as Prisma.InputJsonValue,
        dedupeKey: input.dedupeKey,
      },
    });
    return { enqueued: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { enqueued: false };
    }
    throw error;
  }
}

export type ProcessDeps = {
  db: PrismaClient;
  notifier: Notifier;
  now?: () => Date;
  batchSize?: number;
  staleProcessingMs?: number;
};

export type ProcessResult = {
  processed: number;
  failed: number;
  dead: number;
};

/**
 * Uma passada do worker: recupera mensagens presas, reivindica um lote, e
 * despacha cada uma com retry/backoff. Mensagens `DONE`/`DEAD` são terminais e
 * nunca voltam a ser processadas.
 */
export async function processOutboxOnce(
  deps: ProcessDeps,
): Promise<ProcessResult> {
  const now = deps.now?.() ?? new Date();
  const batchSize = deps.batchSize ?? 50;
  const staleMs = deps.staleProcessingMs ?? 5 * 60 * 1_000;
  const { db } = deps;

  // 1. Recupera mensagens que ficaram em PROCESSING (worker caiu no meio).
  await db.outboxMessage.updateMany({
    where: {
      status: "PROCESSING",
      claimedAt: { lt: new Date(now.getTime() - staleMs) },
    },
    data: { status: "PENDING", claimId: null, claimedAt: null },
  });

  // 2. Seleciona candidatos e reivindica (guard `status: PENDING` evita corrida).
  const candidates = await db.outboxMessage.findMany({
    where: { status: "PENDING", nextRetryAt: { lte: now } },
    orderBy: { createdAt: "asc" },
    take: batchSize,
    select: { id: true },
  });
  if (candidates.length === 0) return { processed: 0, failed: 0, dead: 0 };

  const claimId = crypto.randomUUID();
  await db.outboxMessage.updateMany({
    where: { id: { in: candidates.map((c) => c.id) }, status: "PENDING" },
    data: { status: "PROCESSING", claimId, claimedAt: now },
  });

  const batch = await db.outboxMessage.findMany({
    where: { claimId },
    orderBy: { createdAt: "asc" },
  });

  const result: ProcessResult = { processed: 0, failed: 0, dead: 0 };

  for (const message of batch) {
    try {
      await dispatch(deps, message);
      await db.outboxMessage.update({
        where: { id: message.id },
        data: {
          status: "DONE",
          processedAt: new Date(),
          claimId: null,
          claimedAt: null,
          lastError: null,
        },
      });
      result.processed++;
    } catch (error) {
      const attempts = message.attempts + 1;
      const nextState = outboxStateAfterFailure(attempts);
      await db.outboxMessage.update({
        where: { id: message.id },
        data: {
          attempts,
          status: nextState,
          claimId: null,
          claimedAt: null,
          lastError: error instanceof Error ? error.message : String(error),
          nextRetryAt:
            nextState === "PENDING"
              ? new Date(now.getTime() + retryDelayMs(attempts))
              : message.nextRetryAt,
        },
      });
      if (nextState === "DEAD") {
        result.dead++;
        logger().error(
          { outboxId: message.id, attempts },
          "outbox_message_dead",
        );
      } else {
        result.failed++;
      }
    }
  }

  return result;
}

async function dispatch(
  deps: ProcessDeps,
  message: { id: string; topic: string; payload: Prisma.JsonValue },
): Promise<void> {
  if (message.topic !== "notification") {
    throw new Error(`Tópico de outbox desconhecido: ${message.topic}`);
  }

  const payload = message.payload as NotificationOutboxPayload;
  const optedOut = payload.subjectId
    ? (
        await deps.db.notificationOptOut.findMany({
          where: { subjectId: payload.subjectId },
          select: { category: true },
        })
      ).map((r) => r.category)
    : [];

  for (const notification of payload.notifications) {
    if (!canSend(notification.category, optedOut)) {
      continue; // opt-out respeitado
    }
    try {
      const { providerId } = await deps.notifier.send(notification);
      await deps.db.notificationLog.create({
        data: {
          outboxId: message.id,
          recipient: notification.recipient,
          channel: notification.channel,
          category: notification.category,
          status: "SENT",
          providerId,
        },
      });
    } catch (error) {
      await deps.db.notificationLog.create({
        data: {
          outboxId: message.id,
          recipient: notification.recipient,
          channel: notification.channel,
          category: notification.category,
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      // Rethrow: a mensagem inteira volta para retry. Mensagens com uma única
      // notificação (o caso comum) ficam idempotentes; multi-notificação com
      // falha no meio pode reenviar as anteriores no retry.
      throw error;
    }
  }
}
