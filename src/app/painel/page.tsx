import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const user = await requireSession();
  const company = user.companies[0];

  return (
    <main>
      <h1>Painel</h1>
      <p>
        Olá, {user.email}
        {company ? ` — ${company.name}` : ""}.
      </p>
      <form action="/sair" method="post">
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
