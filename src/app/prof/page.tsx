import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfPage() {
  const user = await requireSession();
  return (
    <main>
      <h1>Seu perfil</h1>
      <p>Olá, {user.email}. Perfil assumido com sucesso.</p>
      <p>
        Disponibilidade e vínculos entram nas próximas telas (tickets 13 e 14).
      </p>
      <form action="/sair" method="post">
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
