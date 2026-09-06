import { logger, newRequestId, runWithRequestContext } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createDefaultNotifier } from "@/use-cases/notification-providers";
import { processOutboxOnce } from "@/use-cases/outbox";

/**
 * Worker de outbox autônomo, para hosts sem cron gerenciado. Em Vercel, o cron
 * de `vercel.json` chama a rota interna e este loop não é usado.
 */
const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS ?? 5_000);

let stopping = false;

async function tick(): Promise<void> {
  await runWithRequestContext({ requestId: newRequestId() }, async () => {
    const result = await processOutboxOnce({
      db: prisma,
      notifier: createDefaultNotifier(),
    });
    if (result.processed || result.failed || result.dead) {
      logger().info({ ...result }, "outbox_tick");
    }
  });
}

async function loop(): Promise<void> {
  logger().info({ intervalMs: INTERVAL_MS }, "outbox_worker_started");
  while (!stopping) {
    try {
      await tick();
    } catch (error) {
      logger().error({ err: error }, "outbox_tick_failed");
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
  await prisma.$disconnect();
  logger().info({}, "outbox_worker_stopped");
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    stopping = true;
  });
}

void loop();
