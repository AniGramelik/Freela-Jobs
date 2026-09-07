"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, ClipboardList, Radio, UserRound } from "lucide-react";

import { cn } from "@/lib/cn";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/prof/convocacoes", label: "Convocações", icon: Radio },
  { href: "/prof/vagas", label: "Vagas", icon: CalendarClock },
  { href: "/prof/candidaturas", label: "Candidaturas", icon: ClipboardList },
  { href: "/prof", label: "Perfil", icon: UserRound },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/prof") return pathname === "/prof";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-panel/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[0.6875rem] font-medium transition-colors",
                  active ? "text-brand" : "text-fg-subtle hover:text-fg",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.75}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
