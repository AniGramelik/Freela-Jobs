/**
 * Rótulos pt-BR para os enums de domínio. A UI nunca mostra a constante crua.
 * Fallback: se um valor novo aparecer antes de ganhar rótulo, mostra ele
 * capitalizado em vez de "SUBMITTED".
 */

function humanize(value: string): string {
  const s = value.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const JOB_VINCULO: Record<string, string> = {
  DIARIA: "Diária",
  TEMPORARIO: "Temporário",
  PJ: "PJ",
  CLT: "CLT",
  ESTAGIO: "Estágio",
};

const JOB_LOCATION_MODE: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

const JOB_STATUS: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicada",
  CLOSED: "Encerrada",
  CANCELLED: "Cancelada",
  FILLED: "Preenchida",
};

const APPLICATION_STATE: Record<string, string> = {
  SUBMITTED: "Enviada",
  UNDER_REVIEW: "Em análise",
  SHORTLISTED: "Selecionada",
  OFFERED: "Oferta feita",
  ACCEPTED: "Aceita",
  REJECTED: "Descartada",
  WITHDRAWN: "Retirada",
};

export const jobVinculoLabel = (v: string): string => JOB_VINCULO[v] ?? humanize(v);
export const jobLocationModeLabel = (v: string): string =>
  JOB_LOCATION_MODE[v] ?? humanize(v);
export const jobStatusLabel = (v: string): string => JOB_STATUS[v] ?? humanize(v);
export const applicationStateLabel = (v: string): string =>
  APPLICATION_STATE[v] ?? humanize(v);

type Tone = "neutral" | "pos" | "neg" | "pend" | "brand";

export const jobStatusTone: Record<string, Tone> = {
  DRAFT: "neutral",
  PUBLISHED: "pos",
  CLOSED: "neutral",
  CANCELLED: "neg",
  FILLED: "brand",
};

export const applicationStateTone: Record<string, Tone> = {
  SUBMITTED: "pend",
  UNDER_REVIEW: "brand",
  SHORTLISTED: "pos",
  OFFERED: "brand",
  ACCEPTED: "pos",
  REJECTED: "neg",
  WITHDRAWN: "neutral",
};
