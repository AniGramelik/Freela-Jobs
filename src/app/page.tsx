import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Freela Jobs</h1>
      <p>Organização e busca de trabalho para pequenos negócios e profissionais.</p>
      <p>
        <Link href="/cadastro">Criar conta da empresa</Link>
        {" · "}
        <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}
