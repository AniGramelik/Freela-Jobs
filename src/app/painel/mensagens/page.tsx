import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { EmptyState, PageHeader, PageShell } from "@/components/ui/layout";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { listConversations } from "@/use-cases/chat";

export const dynamic = "force-dynamic";

export default async function MensagensPage() {
  const { company } = await requireCompanyContext();
  const conversations = await listConversations(prisma, {
    side: "COMPANY",
    companyId: company.id,
  });

  return (
    <PageShell>
      <PageHeader
        title="Mensagens"
        meta="Conversas com profissionais da sua base e do mural."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={18} strokeWidth={1.75} aria-hidden />}
          title="Nenhuma conversa ainda"
          hint="Abra uma conversa a partir de uma candidatura, da rede local ou de uma convocação."
        />
      ) : (
        <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-panel shadow-sm">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/painel/mensagens/${c.id}`}
                className="flex items-center gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-panel-2"
              >
                <span
                  aria-hidden
                  className={
                    c.hasUnread
                      ? "mt-0.5 size-2 shrink-0 rounded-full bg-brand"
                      : "mt-0.5 size-2 shrink-0 rounded-full bg-transparent"
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={
                        c.hasUnread
                          ? "truncate text-sm font-semibold text-fg"
                          : "truncate text-sm font-medium text-fg"
                      }
                    >
                      {c.counterpartName}
                    </span>
                    <span className="tnum shrink-0 text-[0.75rem] text-fg-subtle">
                      {c.lastMessageAt.toLocaleDateString("pt-BR")}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[0.8125rem] text-fg-subtle">
                    {c.contextLabel ? `${c.contextLabel} · ` : ""}
                    {c.preview}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
