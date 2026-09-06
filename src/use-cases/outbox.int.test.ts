import { Prisma, type PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  Notifier,
  type NotificationChannel,
  type NotificationProvider,
  type OutboundNotification,
} from "./notifier";
import { enqueueOutbox, processOutboxOnce } from "./outbox";

const db: PrismaClient = getTestDb();

class FakeProvider implements NotificationProvider {
  readonly calls: OutboundNotification[] = [];
  failTimes = 0;

  constructor(readonly channel: NotificationChannel = "EMAIL") {}

  async send(notification: OutboundNotification) {
    this.calls.push(notification);
    if (this.failTimes > 0) {
      this.failTimes -= 1;
      throw new Error("provider boom");
    }
    return { providerId: "fake_provider_id" };
  }
}

const notification = (
  over: Partial<OutboundNotification> = {},
): OutboundNotification => ({
  recipient: "pessoa@exemplo.com",
  channel: "EMAIL",
  category: "callout",
  template: "callout_new",
  data: {},
  ...over,
});

const enqueueOne = (dedupeKey: string, payload = { notifications: [notification()] }) =>
  enqueueOutbox(db, { topic: "notification", payload, dedupeKey });

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

describe("outbox", () => {
  it("despacha uma notificação e marca a mensagem como DONE + loga SENT", async () => {
    const provider = new FakeProvider();
    await enqueueOne("k1");

    const result = await processOutboxOnce({
      db,
      notifier: new Notifier([provider]),
    });

    expect(result).toEqual({ processed: 1, failed: 0, dead: 0 });
    expect(provider.calls).toHaveLength(1);

    const msg = await db.outboxMessage.findFirstOrThrow();
    expect(msg.status).toBe("DONE");
    expect(msg.processedAt).not.toBeNull();

    const logs = await db.notificationLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe("SENT");
    expect(logs[0]?.providerId).toBe("fake_provider_id");
  });

  it("é idempotente por dedupeKey: reenfileirar não cria segunda mensagem", async () => {
    expect(await enqueueOne("dup")).toEqual({ enqueued: true });
    expect(await enqueueOne("dup")).toEqual({ enqueued: false });
    expect(await db.outboxMessage.count()).toBe(1);
  });

  it("reprocessar não reenvia: DONE é terminal", async () => {
    const provider = new FakeProvider();
    await enqueueOne("k2");
    const notifier = new Notifier([provider]);

    await processOutboxOnce({ db, notifier });
    const second = await processOutboxOnce({ db, notifier });

    expect(second).toEqual({ processed: 0, failed: 0, dead: 0 });
    expect(provider.calls).toHaveLength(1);
  });

  it("falha do provedor: agenda retry com backoff e loga FAILED", async () => {
    const provider = new FakeProvider();
    provider.failTimes = 1;
    await enqueueOne("k3");
    const tickAt = new Date();

    const result = await processOutboxOnce({
      db,
      notifier: new Notifier([provider]),
      now: () => tickAt,
    });

    expect(result).toEqual({ processed: 0, failed: 1, dead: 0 });
    const msg = await db.outboxMessage.findFirstOrThrow();
    expect(msg.status).toBe("PENDING");
    expect(msg.attempts).toBe(1);
    expect(msg.nextRetryAt.getTime()).toBeGreaterThan(tickAt.getTime());
    expect(msg.lastError).toContain("provider boom");

    const logs = await db.notificationLog.findMany();
    expect(logs[0]?.status).toBe("FAILED");
  });

  it("vai a DEAD após o máximo de tentativas", async () => {
    const provider = new FakeProvider();
    provider.failTimes = 10;
    await enqueueOne("k4");
    const notifier = new Notifier([provider]);

    let last = { processed: 0, failed: 0, dead: 0 };
    for (let i = 1; i <= 5; i += 1) {
      last = await processOutboxOnce({
        db,
        notifier,
        now: () => new Date(Date.now() + i * 3_600_000),
      });
    }

    expect(last.dead).toBe(1);
    const msg = await db.outboxMessage.findFirstOrThrow();
    expect(msg.status).toBe("DEAD");
    expect(msg.attempts).toBe(5);
  });

  it("recupera mensagem presa em PROCESSING (worker caiu no meio)", async () => {
    const provider = new FakeProvider();
    await db.outboxMessage.create({
      data: {
        topic: "notification",
        dedupeKey: "stuck",
        payload: {
          notifications: [notification()],
        } as unknown as Prisma.InputJsonValue,
        status: "PROCESSING",
        claimId: "old-claim",
        claimedAt: new Date(Date.now() - 10 * 60_000),
      },
    });

    const result = await processOutboxOnce({
      db,
      notifier: new Notifier([provider]),
    });

    expect(result.processed).toBe(1);
    expect(provider.calls).toHaveLength(1);
    expect((await db.outboxMessage.findFirstOrThrow()).status).toBe("DONE");
  });

  it("respeita opt-out de categoria não transacional, mas sempre envia transacional", async () => {
    const provider = new FakeProvider();
    await db.notificationOptOut.create({
      data: { subjectId: "user_9", category: "digest" },
    });
    await enqueueOutbox(db, {
      topic: "notification",
      dedupeKey: "mixed",
      payload: {
        subjectId: "user_9",
        notifications: [
          notification({ category: "digest", template: "weekly" }),
          notification({ category: "callout" }),
        ],
      },
    });

    const result = await processOutboxOnce({
      db,
      notifier: new Notifier([provider]),
    });

    expect(result.processed).toBe(1);
    expect(provider.calls.map((c) => c.category)).toEqual(["callout"]);
    const logs = await db.notificationLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.category).toBe("callout");
  });
});
