import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-brand text-xs font-bold text-fg-onbrand">
          F
        </span>
        <span className="text-sm font-semibold tracking-[-0.01em]">
          Freela Jobs
        </span>
      </div>

      <h1 className="mt-8 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-fg">
        Organize e encontre trabalho sem o grupo de WhatsApp.
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
        A empresa monta uma convocação clara e a equipe responde em dois toques.
        Do reforço de última hora à vaga por diária.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <Link href="/cadastro" className={buttonClass("primary", "md")}>
          Criar conta da empresa
        </Link>
        <Link href="/entrar" className={buttonClass("secondary", "md")}>
          Entrar
        </Link>
      </div>
    </main>
  );
}
