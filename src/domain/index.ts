/**
 * Camada de domínio: funções puras, sem I/O.
 *
 * Máquinas de estado, invariantes de integridade e cálculos ficam aqui
 * (ADR-0001). Nada neste diretório importa Prisma, `fetch`, `Date.now` de
 * forma não injetada, ou qualquer efeito colateral.
 */

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
