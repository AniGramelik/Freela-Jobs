import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Radio,
  Search,
  Users,
} from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/layout";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "responsável",
  MANAGER: "gestor",
  STAFF: "operador",
};

const SECTIONS: {
  href: string;
  label: string;
  hint: string;
  icon: typeof Radio;
}[] = [
  {
    href: "/painel/convocacoes",
    label: "Convocações",
    hint: "Chame a equipe para um turno e acompanhe quem topou.",
    icon: Radio,
  },
  {
    href: "/painel/vagas",
    label: "Vagas",
    hint: "Publique vagas no mural e receba candidaturas.",
    icon: CalendarClock,
  },
  {
    href: "/painel/equipe",
    label: "Equipe",
    hint: "Seu acervo de profissionais já conhecidos.",
    icon: Users,
  },
  {
    href: "/painel/rede",
    label: "Rede local",
    hint: "Busque profissionais fora da sua base.",
    icon: Search,
  },
  {
    href: "/painel/empresa",
    label: "Empresa",
    hint: "Endereço e dados do estabelecimento.",
    icon: Building2,
  },
];

export default async function PainelPage() {
  const { user, company } = await requireCompanyContext();

  return (
    <PageShell>
      <PageHeader
        title={company.name}
        meta={`${user.email} · ${ROLE_LABEL[company.role] ?? company.role.toLowerCase()}`}
        actions={
          <Link
            href="/painel/convocacoes/nova"
            className={buttonClass("primary", "md")}
          >
            Nova convocação
          </Link>
        }
      />

      <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-panel shadow-sm">
        {SECTIONS.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-4 px-4 py-3.5 no-underline transition-colors hover:bg-panel-2"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-panel-2 text-fg-subtle group-hover:text-brand">
                <Icon size={17} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-fg">{label}</span>
                <span className="block truncate text-[0.8125rem] text-fg-subtle">
                  {hint}
                </span>
              </span>
              <ArrowRight
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
