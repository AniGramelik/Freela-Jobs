"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { sendMessage, startConversation } from "@/use-cases/chat";

export async function startCompanyConversationAction(
  formData: FormData,
): Promise<void> {
  const { user, company } = await requireCompanyContext();
  const professionalProfileId = String(formData.get("professionalProfileId"));
  const jobPostingId = formData.get("jobPostingId")
    ? String(formData.get("jobPostingId"))
    : null;
  const callOutId = formData.get("callOutId")
    ? String(formData.get("callOutId"))
    : null;

  const res = await startConversation(prisma, {
    companyId: company.id,
    professionalProfileId,
    openerSide: "COMPANY",
    openerUserId: user.id,
    jobPostingId,
    callOutId,
  });
  if (!res.ok) redirect("/painel/mensagens");
  redirect(`/painel/mensagens/${res.value.conversationId}`);
}

export async function sendCompanyMessageAction(formData: FormData): Promise<void> {
  const { user } = await requireCompanyContext();
  const conversationId = String(formData.get("conversationId"));
  await sendMessage(prisma, {
    conversationId,
    senderUserId: user.id,
    body: String(formData.get("body") ?? ""),
  });
  revalidatePath(`/painel/mensagens/${conversationId}`);
}

