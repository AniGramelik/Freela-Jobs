import { err, ok, type Result } from "./index";

/**
 * Normalização de telefone para E.164. No piloto (Colatina/BR) o país padrão é
 * o Brasil: aceita formatos locais com DDD e devolve `+55...`.
 */

export function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function toE164(
  raw: string,
  defaultCountry: "BR" = "BR",
): Result<string, "invalid"> {
  const cleaned = raw.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return isValidE164(cleaned) ? ok(cleaned) : err("invalid");
  }

  const digits = cleaned.replace(/\D/g, "");

  if (defaultCountry === "BR") {
    // já com código do país (55 + 10/11 dígitos)
    if (digits.length === 12 || digits.length === 13) {
      const candidate = `+${digits}`;
      return isValidE164(candidate) ? ok(candidate) : err("invalid");
    }
    // local: DDD (2) + 8 (fixo) ou 9 (móvel)
    if (digits.length === 10 || digits.length === 11) {
      return ok(`+55${digits}`);
    }
  }

  return err("invalid");
}
