"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  hidePhoneInConversation,
  revealPhoneInConversation,
  sendMessage,
  startConversation,
} from "@/use-cases/chat";

export async function startProfConversationAction(
  formData: FormData,
): Promise<void> {
  const { user, professionalProfileId } = await requireProfessional();
  const companyId = String(formData.get("companyId"));
  const jobPostingId = formData.get("jobPostingId")
    ? String(formData.get("jobPostingId"))
    : null;

  const res = await startConversation(prisma, {
    companyId,
    professionalProfileId,
    openerSide: "PROFESSIONAL",
    openerUserId: user.id,
    jobPostingId,
  });
  if (!res.ok) redirect("/prof/mensagens");
  redirect(`/prof/mensagens/${res.value.conversationId}`);
}

export async function sendProfMessageAction(formData: FormData): Promise<void> {
  const { user } = await requireProfessional();
  const conversationId = String(formData.get("conversationId"));
  await sendMessage(prisma, {
    conversationId,
    senderUserId: user.id,
    body: String(formData.get("body") ?? ""),
  });
  revalidatePath(`/prof/mensagens/${conversationId}`);
}

export async function togglePhoneAction(formData: FormData): Promise<void> {
  const { user } = await requireProfessional();
  const conversationId = String(formData.get("conversationId"));
  const reveal = formData.get("reveal") === "1";
  if (reveal) {
    await revealPhoneInConversation(prisma, {
      conversationId,
      professionalUserId: user.id,
    });
  } else {
    await hidePhoneInConversation(prisma, {
      conversationId,
      professionalUserId: user.id,
    });
  }
  revalidatePath(`/prof/mensagens/${conversationId}`);
}
