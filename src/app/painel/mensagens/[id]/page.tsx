import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { ChatThread } from "@/components/app/chat-thread";
import { PageShell } from "@/components/ui/layout";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { getConversation, markConversationRead } from "@/use-cases/chat";

import { sendCompanyMessageAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConversaEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireCompanyContext();
  const { id } = await params;

  const res = await getConversation(prisma, {
    conversationId: id,
    viewerUserId: user.id,
  });
  if (!res.ok) notFound();
  const c = res.value;

  await markConversationRead(prisma, { conversationId: id, viewerUserId: user.id });

  return (
    <PageShell>
      <div className="flex h-[calc(100dvh-7rem)] flex-col">
        <Link
          href="/painel/mensagens"
          className="mb-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted no-underline hover:text-fg"
        >
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
          Mensagens
        </Link>

        <header className="rounded-xl border border-hairline bg-panel p-4 shadow-sm">
          <h1 className="font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-fg">
            {c.counterpartName}
          </h1>
          {c.contextLabel ? (
            <p className="mt-0.5 text-[0.8125rem] text-fg-subtle">
              {c.contextLabel}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-fg-muted">
            {c.counterpartEmail ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} strokeWidth={1.75} aria-hidden />
                {c.counterpartEmail}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} strokeWidth={1.75} aria-hidden />
              {c.counterpartPhone ? (
                <span className="tnum">
                  {c.counterpartPhone}
                  {c.phoneRevealedAt
                    ? ` · liberado em ${c.phoneRevealedAt.toLocaleDateString("pt-BR")}`
                    : ""}
                </span>
              ) : (
                <span className="text-fg-subtle">
                  telefone não liberado pelo profissional
                </span>
              )}
            </span>
          </div>
        </header>

        <ChatThread
          messages={c.messages.map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
            mine: m.mine,
          }))}
          sendAction={sendCompanyMessageAction}
          hiddenFields={{ conversationId: id }}
          disabled={c.state === "ARCHIVED"}
          disabledNote="Conversa arquivada."
        />
      </div>
    </PageShell>
  );
}
