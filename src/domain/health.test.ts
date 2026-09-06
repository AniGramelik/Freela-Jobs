import { describe, expect, it } from "vitest";

import {
  aggregateHealth,
  httpStatusForHealth,
  type HealthCheck,
} from "./health";

const check = (
  status: HealthCheck["status"],
  name: string = status,
): HealthCheck => ({ name, status });

describe("aggregateHealth", () => {
  it("é ok quando todos os checks considerados estão ok", () => {
    expect(aggregateHealth([check("ok", "app"), check("ok", "database")]).status).toBe(
      "ok",
    );
  });

  it("ignora checks skipped ao decidir o status", () => {
    const report = aggregateHealth([check("ok", "app"), check("skipped", "queue")]);
    expect(report.status).toBe("ok");
    expect(report.checks).toHaveLength(2);
  });

  it("é degraded se algum check está degraded e nenhum down", () => {
    expect(
      aggregateHealth([check("ok"), check("degraded"), check("skipped")]).status,
    ).toBe("degraded");
  });

  it("é down se algum check está down, mesmo com outros degraded", () => {
    expect(
      aggregateHealth([check("degraded"), check("down"), check("ok")]).status,
    ).toBe("down");
  });
});

describe("httpStatusForHealth", () => {
  it("503 só quando down", () => {
    expect(httpStatusForHealth("down")).toBe(503);
    expect(httpStatusForHealth("degraded")).toBe(200);
    expect(httpStatusForHealth("ok")).toBe(200);
  });
});
