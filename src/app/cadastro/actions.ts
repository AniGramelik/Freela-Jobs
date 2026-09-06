"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { signUpCompany } from "@/use-cases/auth";

export type SignUpState = { error?: string } | null;

const MESSAGES: Record<string, string> = {
  invalid_email: "E-mail inválido.",
  weak_password: "A senha precisa de pelo menos 8 caracteres.",
  email_taken: "Já existe uma conta com esse e-mail.",
  missing: "Preencha todos os campos.",
};

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "");

  if (!email || !password || !companyName) return { error: MESSAGES.missing };

  const result = await signUpCompany(prisma, { email, password, companyName });
  if (!result.ok) {
    return { error: MESSAGES[result.error] ?? "Não foi possível criar a conta." };
  }

  redirect("/cadastro/confirme");
}
