import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { resolveSession } from "@/use-cases/session";

const COOKIE = "fj_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export type SessionUser = {
  id: string;
  email: string;
  companies: { id: string; name: string; role: "OWNER" | "MANAGER" }[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readSessionToken();
  if (!token) return null;

  const resolved = await resolveSession(prisma, { token });
  if (!resolved) return null;

  const user = await prisma.user.findUnique({
    where: { id: resolved.userId },
    include: { memberships: { include: { company: true } } },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    companies: user.memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      role: m.role,
    })),
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");
  return user;
}
