import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

const DEFAULT_ASIDE = {
  headline: "O trabalho certo encontra a pessoa certa.",
  lines: [
    "Banco de talentos que fica com a empresa",
    "Mural de vagas por diária, temporário ou fixo",
    "Convocação com resposta em dois toques",
    "Conversa direta, telefone só quando você quiser",
  ],
};

export function AuthCard({
  title,
  hint,
  children,
  footer,
  aside = DEFAULT_ASIDE,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  footer?: ReactNode;
  aside?: { headline: string; lines: string[] } | null;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl items-stretch">
      {aside ? (
        <aside className="fj-grain relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-brand-gradient p-10 text-white lg:flex">
          <Link href="/" className="no-underline">
            <Logo variant="full" size={24} tone="onDark" />
          </Link>
          <div>
            <p className="font-display text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em]">
              {aside.headline}
            </p>
            <ul className="mt-6 space-y-2.5 text-[0.875rem] text-white/85">
              {aside.lines.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[0.75rem] text-white/55">
            Colatina e região · pt-BR
          </p>
        </aside>
      ) : null}

      <div className="flex flex-1 flex-col justify-center px-6 py-14 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="flex items-center no-underline lg:hidden"
          >
            <Logo variant="full" size={22} />
          </Link>

          <h1 className="font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.02em] text-fg lg:mt-0 mt-8">
            {title}
          </h1>
          {hint ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
              {hint}
            </p>
          ) : null}

          <div className="mt-7">{children}</div>

          {footer ? (
            <p className="mt-6 text-[0.8125rem] text-fg-muted">{footer}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
