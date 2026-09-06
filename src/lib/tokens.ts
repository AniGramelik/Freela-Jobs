import { createHash, randomBytes } from "node:crypto";

/**
 * Tokens opacos para convites, magic links, verificação de e-mail e sessão.
 * Guardamos só o hash; o valor cru vai no link/cookie e nunca no banco.
 */

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
