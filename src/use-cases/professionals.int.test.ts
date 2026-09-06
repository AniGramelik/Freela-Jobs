import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  listCompanyProfessionals,
  registerManagedProfessional,
  updateWorkRelationship,
} from "./professionals";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const company = (name: string) => db.company.create({ data: { name } });

describe("registerManagedProfessional", () => {
  it("cria perfil MANAGED + vínculo ACTIVE com funções e origem", async () => {
    const co = await company("Bar do Zé");
    const result = await registerManagedProfessional(db, {
      companyId: co.id,
      fullName: "  João Silva ",
      phone: "(27) 99912-3456",
      roles: ["garçom", "apoio"],
      sourceNote: "trabalha aos sábados",
      privateNote: "pontual",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.reused).toBe(false);

    const profile = await db.professionalProfile.findUniqueOrThrow({
      where: { id: result.value.professionalProfileId },
    });
    expect(profile.fullName).toBe("João Silva");
    expect(profile.phoneE164).toBe("+5527999123456");
    expect(profile.state).toBe("MANAGED");
    expect(profile.createdByCompanyId).toBe(co.id);

    const rel = await db.workRelationship.findUniqueOrThrow({
      where: { id: result.value.relationshipId },
    });
    expect(rel.state).toBe("ACTIVE");
    expect(rel.roles).toEqual(["garçom", "apoio"]);
    expect(rel.privateNote).toBe("pontual");
  });

  it("recusa telefone inválido e nome vazio", async () => {
    const co = await company("X");
    expect(
      await registerManagedProfessional(db, {
        companyId: co.id,
        fullName: "Fulano",
        phone: "123",
      }),
    ).toEqual({ ok: false, error: "invalid_phone" });
    expect(
      await registerManagedProfessional(db, {
        companyId: co.id,
        fullName: " ",
        phone: "27999123456",
      }),
    ).toEqual({ ok: false, error: "invalid_name" });
  });

  it("mesmo telefone em outra empresa NÃO duplica o perfil, só adiciona vínculo", async () => {
    const a = await company("Empresa A");
    const b = await company("Empresa B");
    const first = await registerManagedProfessional(db, {
      companyId: a.id,
      fullName: "Maria",
      phone: "27999123456",
    });
    if (!first.ok) throw new Error("setup");

    const second = await registerManagedProfessional(db, {
      companyId: b.id,
      fullName: "Maria (na B)",
      phone: "+5527999123456",
      roles: ["chapeira"],
    });

    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.value.reused).toBe(true);
    expect(second.value.professionalProfileId).toBe(
      first.value.professionalProfileId,
    );
    expect(await db.professionalProfile.count()).toBe(1);
    expect(await db.workRelationship.count()).toBe(2);
  });

  it("mesmo telefone na mesma empresa → already_linked", async () => {
    const co = await company("Empresa A");
    await registerManagedProfessional(db, {
      companyId: co.id,
      fullName: "Ana",
      phone: "27999123456",
    });
    expect(
      await registerManagedProfessional(db, {
        companyId: co.id,
        fullName: "Ana de novo",
        phone: "27999123456",
      }),
    ).toEqual({ ok: false, error: "already_linked" });
  });
});

describe("listCompanyProfessionals", () => {
  it("lista só o acervo da empresa e busca por nome, telefone e função", async () => {
    const a = await company("A");
    const b = await company("B");
    await registerManagedProfessional(db, {
      companyId: a.id,
      fullName: "João Garçom",
      phone: "27999000001",
      roles: ["garçom"],
    });
    await registerManagedProfessional(db, {
      companyId: a.id,
      fullName: "Paula Segurança",
      phone: "27999000002",
      roles: ["segurança"],
    });
    await registerManagedProfessional(db, {
      companyId: b.id,
      fullName: "Alheio",
      phone: "27999000003",
    });

    expect(await listCompanyProfessionals(db, { companyId: a.id })).toHaveLength(2);
    expect(
      (await listCompanyProfessionals(db, { companyId: a.id, query: "paula" }))
        .map((p) => p.fullName),
    ).toEqual(["Paula Segurança"]);
    expect(
      await listCompanyProfessionals(db, { companyId: a.id, query: "000001" }),
    ).toHaveLength(1);
    expect(
      (await listCompanyProfessionals(db, { companyId: a.id, query: "segurança" }))
        .map((p) => p.fullName),
    ).toEqual(["Paula Segurança"]);
  });

  it("cada empresa vê apenas a própria nota privada", async () => {
    const a = await company("A");
    const b = await company("B");
    await registerManagedProfessional(db, {
      companyId: a.id,
      fullName: "Compartilhado",
      phone: "27999123456",
      privateNote: "nota da A",
    });
    await registerManagedProfessional(db, {
      companyId: b.id,
      fullName: "Compartilhado",
      phone: "27999123456",
      privateNote: "nota da B",
    });

    const fromA = await listCompanyProfessionals(db, { companyId: a.id });
    const fromB = await listCompanyProfessionals(db, { companyId: b.id });
    expect(fromA[0]?.privateNote).toBe("nota da A");
    expect(fromB[0]?.privateNote).toBe("nota da B");
  });
});

describe("updateWorkRelationship", () => {
  it("atualiza o próprio vínculo e recusa o de outra empresa", async () => {
    const a = await company("A");
    const b = await company("B");
    const reg = await registerManagedProfessional(db, {
      companyId: a.id,
      fullName: "Zé",
      phone: "27999123456",
    });
    if (!reg.ok) throw new Error("setup");

    expect(
      await updateWorkRelationship(db, {
        companyId: a.id,
        relationshipId: reg.value.relationshipId,
        roles: ["garçom"],
        privateNote: "novo",
      }),
    ).toEqual({ ok: true, value: { relationshipId: reg.value.relationshipId } });

    expect(
      await updateWorkRelationship(db, {
        companyId: b.id,
        relationshipId: reg.value.relationshipId,
        roles: ["hacker"],
      }),
    ).toEqual({ ok: false, error: "not_found" });

    const rel = await db.workRelationship.findUniqueOrThrow({
      where: { id: reg.value.relationshipId },
    });
    expect(rel.roles).toEqual(["garçom"]);
  });
});
