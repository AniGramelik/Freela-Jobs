import type { ReactNode } from "react";

import { TabBar } from "@/components/app/tab-bar";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();
  return (
    <div className="min-h-dvh pb-16">
      <div className="fj-rise mx-auto w-full max-w-md">{children}</div>
      <TabBar />
    </div>
  );
}
