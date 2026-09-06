import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { consumeMagicLink } from "@/use-cases/auth";
import { createSession } from "@/use-cases/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const base = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/entrar?erro=link", base));
  }

  const result = await consumeMagicLink(prisma, { token });
  if (!result.ok) {
    return NextResponse.redirect(new URL("/entrar?erro=link", base));
  }

  const { token: sessionToken } = await createSession(prisma, {
    userId: result.value.userId,
  });
  await setSessionCookie(sessionToken);
  return NextResponse.redirect(new URL("/painel", base));
}
