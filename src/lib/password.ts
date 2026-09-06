import { hash, verify } from "@node-rs/argon2";

/**
 * Hash de senha com Argon2id (ADR-0002). Parâmetros padrão do `@node-rs/argon2`
 * (binário pré-compilado, sem node-gyp).
 */

export function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}
