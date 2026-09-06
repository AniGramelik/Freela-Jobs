"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { registerManagedProfessional } from "@/use-cases/professionals";

export type AddProfessionalState = { error?: string } | null;

const MESSAGES: Record<string, string> = {
  invalid_name: "Informe o nome do profissional.",
  invalid_phone: "Telefone inválido. Use DDD + número.",
  already_linked: "Esse profissional já está no seu acervo.",
  missing: "Preencha nome e telefone.",
};

function parseRoles(raw: string): string[] {
  return raw
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
}

export async function addProfessionalAction(
  _prev: AddProfessionalState,
  formData: FormData,
): Promise<AddProfessionalState> {
  const { company } = await requireCompanyContext();

  const fullName = String(formData.get("fullName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const email = String(formData.get("email") ?? "");
  const roles = parseRoles(String(formData.get("roles") ?? ""));
  const privateNote = String(formData.get("privateNote") ?? "");

  if (!fullName || !phone) return { error: MESSAGES.missing };

  const result = await registerManagedProfessional(prisma, {
    companyId: company.id,
    fullName,
    phone,
    email: email || null,
    roles,
    privateNote: privateNote || null,
  });

  if (!result.ok) {
    return { error: MESSAGES[result.error] ?? "Não foi possível cadastrar." };
  }

  redirect("/painel/equipe");
}
