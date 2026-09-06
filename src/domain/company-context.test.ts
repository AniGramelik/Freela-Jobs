import { describe, expect, it } from "vitest";

import { resolveActiveCompany, type CompanyOption } from "./company-context";

const A: CompanyOption = { id: "co_A", name: "Bar A", role: "OWNER" };
const B: CompanyOption = { id: "co_B", name: "Buffet B", role: "MANAGER" };

describe("resolveActiveCompany", () => {
  it("sem empresas → null", () => {
    expect(resolveActiveCompany([], "co_A")).toBeNull();
  });

  it("sem id guardado → primeira empresa", () => {
    expect(resolveActiveCompany([A, B], null)).toEqual(A);
  });

  it("id guardado válido → aquela empresa", () => {
    expect(resolveActiveCompany([A, B], "co_B")).toEqual(B);
  });

  it("id guardado inválido → cai para a primeira", () => {
    expect(resolveActiveCompany([A, B], "co_sumiu")).toEqual(A);
  });
});
