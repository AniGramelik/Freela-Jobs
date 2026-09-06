"use client";

import { useEffect } from "react";

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
        <main>
          <h1>Algo deu errado</h1>
          <p>Tente de novo. Se persistir, avise o suporte.</p>
          <button type="button" onClick={() => reset()}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
