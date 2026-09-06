import type { PrismaClient } from "@prisma/client";

/**
 * Rate limit de janela fixa, persistido em `RateLimitBucket`. Usado em login e
 * envio de magic link (ticket 06). Single-instance no piloto; a janela é
 * atômica dentro de uma transação.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
};

export async function consumeRateLimit(
  db: PrismaClient,
  params: { key: string; max: number; windowMs: number; now?: Date },
): Promise<RateLimitResult> {
  const now = params.now ?? new Date();
  const windowEnd = new Date(now.getTime() + params.windowMs);

  return db.$transaction(async (tx) => {
    const bucket = await tx.rateLimitBucket.findUnique({
      where: { key: params.key },
    });

    if (!bucket || bucket.windowEnd <= now) {
      await tx.rateLimitBucket.upsert({
        where: { key: params.key },
        create: { key: params.key, count: 1, windowEnd },
        update: { count: 1, windowEnd },
      });
      return { allowed: true, remaining: params.max - 1 };
    }

    if (bucket.count < params.max) {
      await tx.rateLimitBucket.update({
        where: { key: params.key },
        data: { count: { increment: 1 } },
      });
      return { allowed: true, remaining: params.max - bucket.count - 1 };
    }

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.windowEnd.getTime() - now.getTime(),
    };
  });
}
