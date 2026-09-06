import { NextResponse } from "next/server";

import {
  aggregateHealth,
  httpStatusForHealth,
  type HealthCheck,
} from "@/domain/health";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: "database", status: "ok" };
  } catch (error) {
    logger().error({ err: error }, "healthz_database_check_failed");
    return { name: "database", status: "down", detail: "query falhou" };
  }
}

function checkQueue(): HealthCheck {
  // A fila (outbox) entra no ticket 05; até lá, não há o que checar.
  return { name: "queue", status: "skipped", detail: "outbox: ticket 05" };
}

export async function GET() {
  const checks: HealthCheck[] = [
    { name: "app", status: "ok" },
    await checkDatabase(),
    checkQueue(),
  ];

  const report = aggregateHealth(checks);
  return NextResponse.json(report, {
    status: httpStatusForHealth(report.status),
  });
}
