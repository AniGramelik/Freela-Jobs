import type { ReactNode } from "react";

import { NavRail } from "@/components/app/nav-rail";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { countUnreadConversations } from "@/use-cases/chat";
import { loadSessionContext } from "@/use-cases/company-context";

import { CompanySwitcher } from "./CompanySwitcher";

export const dynamic = "force-dynamic";

/** Toda tela sob /painel exige sessão. A empresa ativa é exigida por página. */
export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireSession();
  const ctx = await loadSessionContext(prisma, {
    userId: user.id,
    storedActiveCompanyId: user.activeCompany?.id ?? null,
  });

  const unreadMessages = ctx?.activeCompany
    ? await countUnreadConversations(prisma, {
        side: "COMPANY",
        companyId: ctx.activeCompany.id,
      })
    : 0;

  return (
    <div className="min-h-dvh">
      <NavRail
        email={user.email}
        unreadMessages={unreadMessages}
        header={
          <CompanySwitcher
            companies={ctx?.companies ?? []}
            activeId={ctx?.activeCompany?.id}
          />
        }
      />
      <div className="pt-14 lg:pt-0 lg:pl-60">{children}</div>
    </div>
  );
}
