import type { ReactNode } from "react";

import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Toda tela sob /painel exige sessão. A empresa ativa é exigida por página. */
export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();
  return children;
}
