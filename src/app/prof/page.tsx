import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Radio,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const LINKS: { href: string; label: string; icon: typeof Radio }[] = [
  { href: "/prof/convocacoes", label: "Convocações", icon: Radio },
  { href: "/prof/vagas", label: "Vagas do mural", icon: CalendarClock },
  { href: "/prof/candidaturas", label: "Minhas candidaturas", icon: ClipboardList },
  { href: "/prof/disponibilidade", label: "Minha disponibilidade", icon: CalendarClock },
  { href: "/prof/vinculos", label: "Meus vínculos", icon: Users },
  { href: "/prof/rede", label: "Rede local (visibilidade)", icon: UserRound },
  { href: "/prof/historico", label: "Meu histórico", icon: ClipboardList },
  { href: "/prof/meus-dados", label: "Meus dados (LGPD)", icon: ShieldCheck },
];

export default async function ProfPage() {
  const user = await requireSession();

  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">
        Seu perfil
      </h1>
      <p className="mt-1 text-sm text-fg-muted">{user.email}</p>

      <ul className="mt-5 divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-panel shadow-sm">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3 px-4 py-3.5 no-underline transition-colors active:bg-panel-2 hover:bg-panel-2"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-panel-2 text-fg-subtle group-hover:text-brand">
                <Icon size={17} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-fg">
                {label}
              </span>
              <ArrowRight
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="shrink-0 text-fg-subtle"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
