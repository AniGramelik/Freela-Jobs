import { NextResponse } from "next/server";

import { newRequestId, runWithRequestContext } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { runRetention } from "@/use-cases/retention";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Job de retenção diário. `?dryRun=1` (default via cron: aplica) apenas relata.
 * Protegido por `Authorization: Bearer $CRON_SECRET`.
 */
async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";

  return runWithRequestContext({ requestId: newRequestId() }, async () => {
    const report = await runRetention(prisma, { dryRun });
    return NextResponse.json(report);
  });
}

export const GET = handle;
export const POST = handle;
