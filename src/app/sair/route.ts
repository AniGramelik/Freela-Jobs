import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { clearSessionCookie, readSessionToken } from "@/lib/session";
import { destroySession } from "@/use-cases/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = await readSessionToken();
  if (token) {
    await destroySession(prisma, { token });
    await clearSessionCookie();
  }
  return NextResponse.redirect(new URL("/entrar", request.nextUrl.origin), {
    status: 303,
  });
}
