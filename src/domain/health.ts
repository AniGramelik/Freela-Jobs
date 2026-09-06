/**
 * Agregação pura do resultado dos checks de saúde. Sem I/O — a rota
 * `/healthz` faz os checks e passa os resultados para cá.
 */

export type CheckStatus = "ok" | "degraded" | "down" | "skipped";

export type HealthCheck = {
  name: string;
  status: CheckStatus;
  detail?: string;
};

export type OverallStatus = "ok" | "degraded" | "down";

export type HealthReport = {
  status: OverallStatus;
  checks: HealthCheck[];
};

export function aggregateHealth(checks: HealthCheck[]): HealthReport {
  const considered = checks.filter((c) => c.status !== "skipped");
  const status: OverallStatus = considered.some((c) => c.status === "down")
    ? "down"
    : considered.some((c) => c.status === "degraded")
      ? "degraded"
      : "ok";
  return { status, checks };
}

export function httpStatusForHealth(status: OverallStatus): number {
  return status === "down" ? 503 : 200;
}
