import type { ReactNode } from "react";

import { TabBar } from "@/components/app/tab-bar";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { countUnreadConversations } from "@/use-cases/chat";

export const dynamic = "force-dynamic";

export default async function ProfLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireSession();
  const unreadMessages = user.professionalProfileId
    ? await countUnreadConversations(prisma, {
        side: "PROFESSIONAL",
        professionalProfileId: user.professionalProfileId,
      })
    : 0;

  return (
    <div className="min-h-dvh pb-16">
      <div className="fj-rise mx-auto w-full max-w-md">{children}</div>
      <TabBar unreadMessages={unreadMessages} />
    </div>
  );
}
