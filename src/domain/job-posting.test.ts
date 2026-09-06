import { describe, expect, it } from "vitest";

import {
  acceptsApplications,
  canPublish,
  statusAfterFill,
  type PublishableJob,
} from "./job-posting";

const base: PublishableJob = {
  status: "DRAFT",
  title: "Garçom para sábado",
  description: "Evento das 18h à meia-noite.",
  categorySlug: "garcom",
  vinculo: "DIARIA",
  locationMode: "PRESENCIAL",
  positions: 2,
  applicationDeadline: new Date("2026-09-20T00:00:00Z"),
};
const now = new Date("2026-09-10T00:00:00Z");

describe("canPublish", () => {
  it("ok para rascunho completo com prazo futuro", () => {
    expect(canPublish(base, now)).toEqual({ ok: true, value: undefined });
  });

  it("recusa quando não é rascunho", () => {
    expect(canPublish({ ...base, status: "PUBLISHED" }, now)).toEqual({
      ok: false,
      error: "not_draft",
    });
  });

  it("recusa campos faltando e prazo no passado e sem vagas", () => {
    expect(canPublish({ ...base, description: " " }, now).ok).toBe(false);
    expect(
      canPublish({ ...base, applicationDeadline: new Date("2026-09-01") }, now),
    ).toEqual({ ok: false, error: "deadline_past" });
    expect(canPublish({ ...base, positions: 0 }, now)).toEqual({
      ok: false,
      error: "no_positions",
    });
  });
});

describe("acceptsApplications", () => {
  it("só PUBLISHED e dentro do prazo", () => {
    expect(acceptsApplications("PUBLISHED", base.applicationDeadline, now)).toBe(
      true,
    );
    expect(acceptsApplications("DRAFT", base.applicationDeadline, now)).toBe(
      false,
    );
    expect(
      acceptsApplications("PUBLISHED", new Date("2026-09-01"), now),
    ).toBe(false);
  });
});

describe("statusAfterFill", () => {
  it("FILLED ao atingir as vagas", () => {
    expect(statusAfterFill(1, 2)).toBe("PUBLISHED");
    expect(statusAfterFill(2, 2)).toBe("FILLED");
  });
});
