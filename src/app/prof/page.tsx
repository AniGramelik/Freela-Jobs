import Link from "next/link";

import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const LINKS: [string, string][] = [
  ["/prof/disponibilidade", "Minha disponibilidade"],
  ["/prof/vinculos", "Meus vínculos"],
  ["/prof/convocacoes", "Convocações"],
  ["/prof/historico", "Meu histórico"],
  ["/prof/meus-dados", "Meus dados (LGPD)"],
  ["/prof/rede", "Rede local (visibilidade)"],
  ["/prof/vagas", "Vagas do mural"],
  ["/prof/candidaturas", "Minhas candidaturas"],
];

export default async function ProfPage() {
  const user = await requireSession();
  return (
    <main>
      <h1>Seu perfil</h1>
      <p>Olá, {user.email}. Perfil assumido com sucesso.</p>
      <nav>
        <ul>
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action="/sair" method="post">
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
