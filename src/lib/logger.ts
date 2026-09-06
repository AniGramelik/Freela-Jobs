import { AsyncLocalStorage } from "node:async_hooks";

import pino from "pino";

/**
 * Log estruturado (JSON) com correlação de request.
 *
 * `runWithRequestContext` embrulha o tratamento de um request; qualquer
 * `logger()` chamado abaixo dele herda o `requestId`. Vale para rotas do app
 * e para o worker (ticket 05), que abre seu próprio contexto por mensagem.
 */

type RequestContext = {
  requestId: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

const root = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      "*.password",
      "*.senha",
      "*.token",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[redacted]",
  },
});

export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

export function logger(): pino.Logger {
  const requestId = currentRequestId();
  return requestId ? root.child({ requestId }) : root;
}
