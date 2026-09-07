"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  LayoutGrid,
  LogOut,
  Radio,
  Users,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string; icon: string };

const ICONS: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  users: Users,
  building: Building2,
  radio: Radio,
  calendar: CalendarClock,
};

const ITEMS: NavItem[] = [
  { href: "/painel", label: "Painel", icon: "grid" },
  { href: "/painel/convocacoes", label: "Convocações", icon: "radio" },
  { href: "/painel/vagas", label: "Vagas", icon: "calendar" },
  { href: "/painel/equipe", label: "Equipe", icon: "users" },
  { href: "/painel/rede", label: "Rede local", icon: "building" },
  { href: "/painel/empresa", label: "Empresa", icon: "building" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/painel") return pathname === "/painel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavRail({
  header,
  email,
}: {
  header: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-30 border-b border-hairline bg-panel/85 backdrop-blur-sm lg:inset-y-0 lg:right-auto lg:w-60 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center gap-2 px-4 lg:h-auto lg:flex-col lg:items-stretch lg:px-3 lg:py-4">
        <Link
          href="/painel"
          className="flex items-center no-underline lg:mb-3 lg:px-1"
        >
          <Logo variant="full" size={22} />
        </Link>

        <div className="hidden lg:block lg:px-1 lg:pb-3">{header}</div>

        <ul className="flex flex-1 items-center gap-0.5 overflow-x-auto lg:flex-none lg:flex-col lg:items-stretch lg:overflow-visible">
          {ITEMS.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutGrid;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand shadow-[inset_2px_0_0_var(--color-brand)]"
                      : "text-fg-muted hover:bg-panel-2 hover:text-fg",
                  )}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:mt-auto lg:block lg:border-t lg:border-hairline lg:px-1 lg:pt-3">
          <p className="truncate px-1.5 pb-1.5 text-[0.75rem] text-fg-subtle">
            {email}
          </p>
          <form action="/sair" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-fg-muted transition-colors hover:bg-panel-2 hover:text-fg"
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden />
              Sair
            </button>
          </form>
        </div>

        <form action="/sair" method="post" className="lg:hidden">
          <button
            type="submit"
            aria-label="Sair"
            className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-panel-2 hover:text-fg"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
    </nav>
  );
}
