import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Contexto de banco que um caso de uso aceita: o cliente completo ou um
 * cliente de transação (`prisma.$transaction(async (tx) => ...)`).
 */
export type DbClient = PrismaClient | Prisma.TransactionClient;
