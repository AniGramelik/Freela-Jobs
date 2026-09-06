import type { Instrumentation } from "next";

/**
 * Hook de instrumentação do Next. `register` roda uma vez na inicialização
 * do servidor — ponto para `Sentry.init()` quando houver `SENTRY_DSN`.
 */
export async function register(): Promise<void> {
  // Reservado para setup de observabilidade (Sentry/OpenTelemetry).
}

/**
 * Captura toda exceção não tratada em Server Components, Route Handlers,
 * middleware e data fetching (App Router).
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { reportError } = await import("@/lib/observability");
  reportError(error, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    routePath: context.routePath,
  });
};
