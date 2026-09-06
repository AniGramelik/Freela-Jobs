import { logger } from "@/lib/logger";

/**
 * Ponto único de captura de erro. Hoje: log estruturado com stack e contexto.
 * Ponto de integração para Sentry/GlitchTip (atrás de `SENTRY_DSN`) sem mudar
 * os chamadores — mesmo padrão da camada `Notifier` (ADR-0004).
 */

export type ErrorContext = Record<string, unknown>;

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err =
    error instanceof Error ? error : new Error(String(error), { cause: error });

  logger().error(
    {
      err: { name: err.name, message: err.message, stack: err.stack },
      ...context,
    },
    "unhandled_error",
  );
}
