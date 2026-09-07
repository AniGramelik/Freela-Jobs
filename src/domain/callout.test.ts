import { describe, expect, it } from "vitest";

import {
  callOutStatusAfterAccept,
  canPublishCallOut,
  canRespond,
} from "./callout";

const future = new Date(Date.now() + 86_400_000);
const now = new Date();

describe("canPublishCallOut", () => {
  it("ok para rascunho com vagas e turno futuro", () => {
    expect(
      canPublishCallOut({ status: "DRAFT", quantity: 2, shiftDate: future }, now),
    ).toEqual({ ok: true, value: undefined });
  });

  it("recusa não-rascunho, sem vaga, turno no passado", () => {
    expect(
      canPublishCallOut({ status: "OPEN", quantity: 1, shiftDate: future }, now)
        .ok,
    ).toBe(false);
    expect(
      canPublishCallOut({ status: "DRAFT", quantity: 0, shiftDate: future }, now),
    ).toEqual({ ok: false, error: "no_quantity" });
    expect(
      canPublishCallOut(
        { status: "DRAFT", quantity: 1, shiftDate: new Date(now.getTime() - 1) },
        now,
      ),
    ).toEqual({ ok: false, error: "shift_past" });
  });
});

describe("callOutStatusAfterAccept", () => {
  it("FILLED ao atingir a quantidade", () => {
    expect(callOutStatusAfterAccept(1, 2)).toBe("OPEN");
    expect(callOutStatusAfterAccept(2, 2)).toBe("FILLED");
  });
});

describe("canRespond", () => {
  it("aceitar só a partir de OFFERED/DECLINED; desistir só de ACCEPTED", () => {
    expect(canRespond("OFFERED", "accept")).toBe(true);
    expect(canRespond("ACCEPTED", "accept")).toBe(false);
    expect(canRespond("ACCEPTED", "withdraw")).toBe(true);
    expect(canRespond("OFFERED", "withdraw")).toBe(false);
    expect(canRespond("OFFERED", "decline")).toBe(true);
  });
});
