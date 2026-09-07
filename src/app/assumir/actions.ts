"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { completeClaim, defaultOtpSender, requestClaimOtp } from "@/use-cases/claim";
import { createSession } from "@/use-cases/session";

export type ClaimState = { error?: string; codeSent?: boolean } | null;

export async function requestOtpAction(
  _prev: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const token = String(formData.get("token") ?? "");
  const result = await requestClaimOtp(prisma, defaultOtpSender, { token });
  if (!result.ok) {
    return {
      error:
        result.error === "rate_limited"
          ? "Muitos pedidos de código. Aguarde alguns minutos."
          : "Convite inválido ou expirado.",
    };
  }
  return { codeSent: true };
}

export async function completeClaimAction(
  _prev: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "");
  const email = String(formData.get("email") ?? "");
  if (!code || !email) return { error: "Informe o código e o e-mail." };

  const result = await completeClaim(prisma, { token, code, email });
  if (!result.ok) {
    const messages: Record<string, string> = {
      invalid_invite: "Convite inválido ou expirado.",
      invalid_code: "Código incorreto.",
      code_expired: "Código expirado. Peça um novo.",
      profile_conflict: "Esse e-mail já tem um perfil de profissional.",
    };
    return { error: messages[result.error] ?? "Não foi possível concluir." };
  }

  const { token: sessionToken } = await createSession(prisma, {
    userId: result.value.userId,
  });
  await setSessionCookie(sessionToken);
  redirect("/prof");
}
