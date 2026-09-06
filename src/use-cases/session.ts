import type { PrismaClient } from "@prisma/client";

import { isExpired, sessionExpiry, shouldRenewSession } from "@/domain/auth";
import { generateToken, hashToken } from "@/lib/tokens";

import type { DbClient } from "./db";

export async function createSession(
  db: DbClient,
  params: { userId: string; now?: Date },
): Promise<{ token: string; expiresAt: Date }> {
  const now = params.now ?? new Date();
  const token = generateToken();
  const expiresAt = sessionExpiry(now);
  await db.session.create({
    data: { userId: params.userId, tokenHash: hashToken(token), expiresAt },
  });
  return { token, expiresAt };
}

export type ResolvedSession = {
  userId: string;
  sessionId: string;
  expiresAt: Date;
};

/**
 * Valida o token de sessão. Expira sessões vencidas (apaga) e renova as que
 * passaram da metade da validade (sliding window).
 */
export async function resolveSession(
  db: PrismaClient,
  params: { token: string; now?: Date },
): Promise<ResolvedSession | null> {
  const now = params.now ?? new Date();
  const tokenHash = hashToken(params.token);
  const session = await db.session.findUnique({ where: { tokenHash } });
  if (!session) return null;

  if (isExpired(session.expiresAt, now)) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  let expiresAt = session.expiresAt;
  if (shouldRenewSession(session.expiresAt, now)) {
    expiresAt = sessionExpiry(now);
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt, lastSeenAt: now },
    });
  } else {
    await db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }

  return { userId: session.userId, sessionId: session.id, expiresAt };
}

export async function destroySession(
  db: DbClient,
  params: { token: string },
): Promise<void> {
  await db.session
    .delete({ where: { tokenHash: hashToken(params.token) } })
    .catch(() => {});
}
