import { z } from "zod";

/**
 * Variáveis de ambiente validadas. Lazy: só valida quando `getEnv()` é
 * chamado (evita quebrar `next build` sem banco). A partir do ticket 06,
 * o acesso a dado passa por aqui.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
