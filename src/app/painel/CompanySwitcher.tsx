"use client";

import { ChevronsUpDown } from "lucide-react";

import type { CompanyOption } from "@/domain/company-context";

export function CompanySwitcher({
  companies,
  activeId,
}: {
  companies: CompanyOption[];
  activeId: string | undefined;
}) {
  const active = companies.find((c) => c.id === activeId) ?? companies[0];

  if (companies.length <= 1) {
    return (
      <div className="rounded-md border border-hairline bg-panel-2 px-2.5 py-1.5">
        <p className="truncate text-[0.8125rem] font-medium text-fg">
          {active?.name ?? "—"}
        </p>
        <p className="text-[0.6875rem] text-fg-subtle">{active?.role}</p>
      </div>
    );
  }

  return (
    <form action="/contexto" method="post" className="relative">
      <label className="sr-only" htmlFor="company-switch">
        Empresa ativa
      </label>
      <select
        id="company-switch"
        name="companyId"
        defaultValue={active?.id}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-full appearance-none rounded-md border border-hairline bg-panel-2 py-1.5 pl-2.5 pr-8 text-[0.8125rem] font-medium text-fg focus:border-brand focus:outline-2 focus:outline-[var(--color-ring)]"
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronsUpDown
        size={14}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle"
      />
      <noscript>
        <button type="submit" className="mt-1 text-[0.75rem] underline">
          Trocar
        </button>
      </noscript>
    </form>
  );
}
