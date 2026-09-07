import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfPage() {
  const user = await requireSession();
  return (
    <main>
      <h1>Seu perfil</h1>
      <p>Olá, {user.email}. Perfil assumido com sucesso.</p>
      <nav>
        <ul>
          <li>
            <a href="/prof/disponibilidade">Minha disponibilidade</a>
          </li>
          <li>
            <a href="/prof/vinculos">Meus vínculos</a>
          </li>
          <li>
            <a href="/prof/convocacoes">Convocações</a>
          </li>
          <li>
            <a href="/prof/historico">Meu histórico</a>
          </li>
          <li>
            <a href="/prof/meus-dados">Meus dados (LGPD)</a>
          </li>
        </ul>
      </nav>
      <form action="/sair" method="post">
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
