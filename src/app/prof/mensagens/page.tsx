import Link from "next/link";

import { EmptyState } from "@/components/ui/layout";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { listConversations } from "@/use-cases/chat";

export const dynamic = "force-dynamic";

export default async function ProfMensagensPage() {
  const { professionalProfileId } = await requireProfessional();
  const conversations = await listConversations(prisma, {
    side: "PROFESSIONAL",
    professionalProfileId,
  });

  return (
    <main className="grid gap-4 px-4 py-6">
      <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">
        Mensagens
      </h1>

      {conversations.length === 0 ? (
        <EmptyState
          title="Nenhuma conversa ainda"
          hint="Quando uma empresa te chamar ou você iniciar a conversa a partir de uma vaga, aparece aqui."
        />
      ) : (
        <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-panel shadow-sm">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/prof/mensagens/${c.id}`}
                className="flex items-center gap-3 px-4 py-3.5 no-underline transition-colors active:bg-panel-2"
              >
                <span
                  aria-hidden
                  className={
                    c.hasUnread
                      ? "size-2 shrink-0 rounded-full bg-brand"
                      : "size-2 shrink-0 rounded-full bg-transparent"
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
                    {c.preview}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
