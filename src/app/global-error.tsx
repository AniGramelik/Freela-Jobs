"use client";

import { useEffect } from "react";

import { Logo } from "@/components/brand/logo";

import "./globals.css";

/**
 * Fronteira de erro de nível de aplicação. O erro no servidor já foi
 * capturado por `onRequestError` (instrumentation.ts); aqui é o fallback
 * visual e o registro do lado do cliente.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("global_error", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-14">
          <Logo variant="mark" size={30} />
          <h1 className="mt-8 font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-fg">
            Algo deu errado
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
            Tente de novo. Se persistir, avise o suporte.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex h-10 w-fit items-center justify-center rounded-md bg-brand-gradient px-4 text-sm font-medium text-white shadow-md transition hover:brightness-[1.06]"
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
