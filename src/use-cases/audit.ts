/**
 * Trilha de auditoria — append-only por construção.
 *
 * A interface só expõe `record`. Não há update nem delete: a imutabilidade é
 * garantida pela ausência dessas operações (e, no banco, pela política do
 * ticket 21). Casos de uso recebem um `AuditRecorder` e nunca falam com a
 * tabela diretamente.
 */

export type AuditEntry = {
  /** Usuário autenticado que disparou a ação, ou `null` (ação de sistema). */
  actorUserId: string | null;
  /** "company:<id>" | "professional:<id>" | "support" | null. */
  actingAs: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  before?: unknown;
  after?: unknown;
};

export interface AuditRecorder {
  record(entry: AuditEntry): Promise<void>;
}

/** Fake para testes: guarda as entradas em memória, na ordem em que chegaram. */
export class InMemoryAuditRecorder implements AuditRecorder {
  readonly entries: AuditEntry[] = [];

  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}
