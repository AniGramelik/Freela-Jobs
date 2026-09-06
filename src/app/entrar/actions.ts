"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { logInWithPassword, requestMagicLink } from "@/use-cases/auth";
import { consumeRateLimit } from "@/use-cases/rate-limit";
import { createSession } from "@/use-cases/session";

export type LoginState = { error?: string; magicLinkSent?: boolean } | null;

const FIFTEEN_MIN = 15 * 60 * 1_000;

export async function passwordLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const limit = await consumeRateLimit(prisma, {
    key: `login:${email.toLowerCase()}`,
    max: 10,
    windowMs: FIFTEEN_MIN,
  });
  if (!limit.allowed) {
    return { error: "Muitas tentativas. Tente de novo em alguns minutos." };
  }

  const result = await logInWithPassword(prisma, { email, password });
  if (!result.ok) {
    return {
      error:
        result.error === "email_not_verified"
          ? "Confirme seu e-mail antes de entrar."
          : "E-mail ou senha incorretos.",
    };
  }

  const { token } = await createSession(prisma, { userId: result.value.userId });
  await setSessionCookie(token);
  redirect("/painel");
}

export async function magicLinkAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "Informe o e-mail." };

  const limit = await consumeRateLimit(prisma, {
    key: `magiclink:${email.toLowerCase()}`,
    max: 3,
    windowMs: FIFTEEN_MIN,
  });
  if (!limit.allowed) {
    return { error: "Já enviamos vários links. Aguarde alguns minutos." };
  }

  await requestMagicLink(prisma, { email });
  // Resposta idêntica exista ou não a conta (sem enumeração).
  return { magicLinkSent: true };
}
