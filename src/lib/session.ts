import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { CompanyOption } from "@/domain/company-context";
import { prisma } from "@/lib/prisma";
import { loadSessionContext } from "@/use-cases/company-context";
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
  sessionId: string;
  companies: CompanyOption[];
  activeCompany: CompanyOption | null;
  professionalProfileId: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readSessionToken();
  if (!token) return null;

  const resolved = await resolveSession(prisma, { token });
  if (!resolved) return null;

  const context = await loadSessionContext(prisma, {
    userId: resolved.userId,
    storedActiveCompanyId: resolved.activeCompanyId,
  });
  if (!context) return null;

  return {
    id: context.user.id,
    email: context.user.email,
    sessionId: resolved.sessionId,
    companies: context.companies,
    activeCompany: context.activeCompany,
    professionalProfileId: context.professionalProfileId,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");
  return user;
}

export type CompanyContext = {
  user: SessionUser;
  company: CompanyOption;
};

/** Sessão + empresa ativa garantidas. Base de tudo que escreve dado de empresa. */
export async function requireCompanyContext(): Promise<CompanyContext> {
  const user = await requireSession();
  if (!user.activeCompany) redirect("/entrar");
  return { user, company: user.activeCompany };
}

/** Sessão + perfil de profissional assumido. Base das telas do profissional. */
export async function requireProfessional(): Promise<{
  user: SessionUser;
  professionalProfileId: string;
}> {
  const user = await requireSession();
  if (!user.professionalProfileId) redirect("/entrar");
  return { user, professionalProfileId: user.professionalProfileId };
}
