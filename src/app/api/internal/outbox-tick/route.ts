import { NextResponse } from "next/server";

import { newRequestId, runWithRequestContext } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createDefaultNotifier } from "@/use-cases/notification-providers";
import { processOutboxOnce } from "@/use-cases/outbox";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Uma passada do worker de outbox, disparada por cron gerenciado (Vercel Cron
 * chama com `Authorization: Bearer $CRON_SECRET`). Fora do cron, exige o mesmo
 * bearer.
 */
async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return runWithRequestContext({ requestId: newRequestId() }, async () => {
    const result = await processOutboxOnce({
      db: prisma,
      notifier: createDefaultNotifier(),
    });
    return NextResponse.json(result);
  });
}

export const GET = handle;
export const POST = handle;
