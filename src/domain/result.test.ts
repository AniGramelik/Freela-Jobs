import { describe, expect, it } from "vitest";

import { err, ok } from "./index";

describe("Result", () => {
  it("ok carrega o valor", () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it("err carrega o erro", () => {
    expect(err("indisponivel")).toEqual({ ok: false, error: "indisponivel" });
  });
});
