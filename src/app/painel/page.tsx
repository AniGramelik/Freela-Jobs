import Link from "next/link";

import { requireCompanyContext } from "@/lib/session";

import { CompanySwitcher } from "./CompanySwitcher";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const { user, company } = await requireCompanyContext();

  return (
    <main>
      <h1>Painel</h1>
      <p>
        Olá, {user.email} — {company.name} ({company.role}).
      </p>

      <CompanySwitcher companies={user.companies} activeId={company.id} />

      <nav>
        <ul>
          <li>
            <Link href="/painel/equipe">Equipe (acervo de profissionais)</Link>
          </li>
          <li>
            <Link href="/painel/empresa">Endereço da empresa</Link>
          </li>
          <li>
            <Link href="/painel/vagas">Vagas (mural)</Link>
          </li>
          <li>
            <Link href="/painel/convocacoes">Convocações</Link>
          </li>
        </ul>
      </nav>

      <form action="/sair" method="post">
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
