"use client";

import { useEffect } from "react";

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
          <span className="grid size-6 place-items-center rounded-md bg-brand text-[0.7rem] font-bold text-fg-onbrand">
            F
          </span>
          <h1 className="mt-8 text-xl font-semibold tracking-[-0.015em] text-fg">
            Algo deu errado
          </h1>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-fg-muted">
            Tente de novo. Se persistir, avise o suporte.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex h-9 w-fit items-center justify-center rounded-md bg-brand px-3.5 text-sm font-medium text-fg-onbrand transition-colors hover:bg-brand-hover"
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
