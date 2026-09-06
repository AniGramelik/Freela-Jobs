import type { CompanyRole } from "./authorization";

/** Resolução pura da empresa ativa da sessão (ticket 07). */

export type CompanyOption = {
  id: string;
  name: string;
  role: CompanyRole;
};

export function resolveActiveCompany(
  companies: readonly CompanyOption[],
  storedId: string | null,
): CompanyOption | null {
  if (companies.length === 0) return null;
  if (storedId) {
    const match = companies.find((c) => c.id === storedId);
    if (match) return match;
  }
  return companies[0] ?? null;
}
