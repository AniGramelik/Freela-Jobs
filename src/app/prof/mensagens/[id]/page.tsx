import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";

import { ChatThread } from "@/components/app/chat-thread";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { getConversation, markConversationRead } from "@/use-cases/chat";

import { sendProfMessageAction, togglePhoneAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConversaProfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireProfessional();
  const { id } = await params;

  const res = await getConversation(prisma, {
    conversationId: id,
    viewerUserId: user.id,
  });
  if (!res.ok) notFound();
  const c = res.value;

  await markConversationRead(prisma, { conversationId: id, viewerUserId: user.id });

  const phoneShared = c.phoneRevealedAt != null;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col px-4 py-4">
      <Link
        href="/prof/mensagens"
        className="mb-2 inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted no-underline hover:text-fg"
      >
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
        Mensagens
      </Link>

      <header className="rounded-xl border border-hairline bg-panel p-4 shadow-sm">
        <h1 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-fg">
          {c.counterpartName}
        </h1>
        {c.contextLabel ? (
          <p className="mt-0.5 text-[0.8125rem] text-fg-subtle">
            {c.contextLabel}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3">
          <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted">
            <Phone size={13} strokeWidth={1.75} aria-hidden />
            {phoneShared
              ? "Empresa está vendo seu telefone"
              : "Seu telefone está oculto"}
          </span>
          <form action={togglePhoneAction}>
            <input type="hidden" name="conversationId" value={id} />
            <input type="hidden" name="reveal" value={phoneShared ? "0" : "1"} />
            <button
              type="submit"
              className={buttonClass(
                phoneShared ? "ghost" : "secondary",
                "sm",
              )}
            >
              {phoneShared ? "Ocultar telefone" : "Mostrar meu telefone"}
            </button>
          </form>
        </div>
      </header>

      <ChatThread
        messages={c.messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          mine: m.mine,
        }))}
        sendAction={sendProfMessageAction}
        hiddenFields={{ conversationId: id }}
        disabled={c.state === "ARCHIVED"}
        disabledNote="Conversa arquivada."
      />
    </div>
  );
}
