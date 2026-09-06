import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { AuditEntry, AuditRecorder } from "./audit";

/**
 * Implementação real do `AuditRecorder` sobre a tabela `AuditLog`.
 * Só grava (`create`) — coerente com o contrato append-only.
 */
export class PrismaAuditRecorder implements AuditRecorder {
  async record(entry: AuditEntry): Promise<void> {
    const data: Prisma.AuditLogCreateInput = {
      actorUserId: entry.actorUserId,
      actingAs: entry.actingAs,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
    };

    if (entry.before !== undefined) {
      data.before = entry.before as Prisma.InputJsonValue;
    }
    if (entry.after !== undefined) {
      data.after = entry.after as Prisma.InputJsonValue;
    }

    await prisma.auditLog.create({ data });
  }
}
