import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getTestDb, resetDb } from "../../test/db";
import {
  consumeMagicLink,
  logInWithPassword,
  requestMagicLink,
  signUpCompany,
  verifyEmail,
} from "./auth";
import { consumeRateLimit } from "./rate-limit";
import { createSession, destroySession, resolveSession } from "./session";

const db: PrismaClient = getTestDb();

beforeEach(() => resetDb(db));
afterAll(() => db.$disconnect());

const signUp = (over: Partial<Parameters<typeof signUpCompany>[1]> = {}) =>
  signUpCompany(db, {
    email: "Dona@Empresa.com",
    password: "senha-forte-123",
    companyName: "Bar do Zé",
    ...over,
  });

describe("signUpCompany", () => {
  it("cria User + Company + membership OWNER, e-mail normalizado, e enfileira verificação", async () => {
    const result = await signUp();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const user = await db.user.findUniqueOrThrow({
      where: { id: result.value.userId },
      include: { memberships: true },
    });
    expect(user.email).toBe("dona@empresa.com");
    expect(user.emailVerifiedAt).toBeNull();
    expect(user.memberships).toHaveLength(1);
    expect(user.memberships[0]?.role).toBe("OWNER");
    expect(user.memberships[0]?.companyId).toBe(result.value.companyId);

    const outbox = await db.outboxMessage.findMany();
    expect(outbox).toHaveLength(1);
    expect(outbox[0]?.dedupeKey).toBe(`email-verify:${result.value.userId}`);
  });

  it("recusa e-mail já usado", async () => {
    await signUp();
    expect(await signUp()).toEqual({ ok: false, error: "email_taken" });
    expect(await db.user.count()).toBe(1);
  });

  it("recusa senha fraca e e-mail inválido", async () => {
    expect(await signUp({ password: "curta" })).toEqual({
      ok: false,
      error: "weak_password",
    });
    expect(await signUp({ email: "sem-arroba" })).toEqual({
      ok: false,
      error: "invalid_email",
    });
  });
});

describe("verifyEmail", () => {
  it("confirma o e-mail, é de uso único e rejeita token expirado", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");

    const first = await verifyEmail(db, { token: s.value.verificationToken });
    expect(first).toEqual({ ok: true, value: { userId: s.value.userId } });
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: s.value.userId } }))
        .emailVerifiedAt,
    ).not.toBeNull();

    expect(await verifyEmail(db, { token: s.value.verificationToken })).toEqual({
      ok: false,
      error: "invalid",
    });

    const s2 = await signUp({ email: "outra@empresa.com" });
    if (!s2.ok) throw new Error("setup");
    expect(
      await verifyEmail(db, {
        token: s2.value.verificationToken,
        now: new Date(Date.now() + 48 * 3_600_000),
      }),
    ).toEqual({ ok: false, error: "expired" });
  });
});

describe("logInWithPassword", () => {
  it("exige e-mail verificado e senha correta", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");

    expect(
      await logInWithPassword(db, {
        email: "dona@empresa.com",
        password: "senha-forte-123",
      }),
    ).toEqual({ ok: false, error: "email_not_verified" });

    await verifyEmail(db, { token: s.value.verificationToken });

    expect(
      await logInWithPassword(db, {
        email: "  DONA@empresa.com ",
        password: "senha-forte-123",
      }),
    ).toEqual({ ok: true, value: { userId: s.value.userId } });

    expect(
      await logInWithPassword(db, {
        email: "dona@empresa.com",
        password: "errada",
      }),
    ).toEqual({ ok: false, error: "invalid_credentials" });

    expect(
      await logInWithPassword(db, {
        email: "ninguem@empresa.com",
        password: "x",
      }),
    ).toEqual({ ok: false, error: "invalid_credentials" });
  });
});

describe("magic link", () => {
  it("gera token, enfileira e-mail, é de uso único e confirma o e-mail", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");

    const req = await requestMagicLink(db, { email: "dona@empresa.com" });
    expect(req.ok).toBe(true);
    if (!req.ok) return;

    expect(await db.magicLinkToken.count()).toBe(1);
    expect(
      await db.outboxMessage.count({ where: { dedupeKey: { startsWith: "magic-link:" } } }),
    ).toBe(1);

    const consumed = await consumeMagicLink(db, { token: req.value.token });
    expect(consumed).toEqual({ ok: true, value: { userId: s.value.userId } });
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: s.value.userId } }))
        .emailVerifiedAt,
    ).not.toBeNull();

    expect(await consumeMagicLink(db, { token: req.value.token })).toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("link para e-mail sem conta consome mas não autentica", async () => {
    const req = await requestMagicLink(db, { email: "fantasma@x.com" });
    if (!req.ok) throw new Error("setup");
    expect(await consumeMagicLink(db, { token: req.value.token })).toEqual({
      ok: false,
      error: "no_account",
    });
  });
});

describe("rate limit", () => {
  it("libera até o máximo e bloqueia depois, resetando após a janela", async () => {
    const key = "magiclink:x@x.com";
    const opts = { key, max: 2, windowMs: 60_000 };
    expect((await consumeRateLimit(db, opts)).allowed).toBe(true);
    expect((await consumeRateLimit(db, opts)).allowed).toBe(true);
    expect((await consumeRateLimit(db, opts)).allowed).toBe(false);
    expect(
      (await consumeRateLimit(db, { ...opts, now: new Date(Date.now() + 61_000) }))
        .allowed,
    ).toBe(true);
  });
});

describe("sessão", () => {
  it("cria, resolve, e destrói", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");

    const { token } = await createSession(db, { userId: s.value.userId });
    const resolved = await resolveSession(db, { token });
    expect(resolved?.userId).toBe(s.value.userId);

    await destroySession(db, { token });
    expect(await resolveSession(db, { token })).toBeNull();
  });

  it("apaga sessão expirada ao resolver", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");
    const { token } = await createSession(db, {
      userId: s.value.userId,
      now: new Date(Date.now() - 40 * 24 * 3_600_000),
    });
    expect(await resolveSession(db, { token })).toBeNull();
    expect(await db.session.count()).toBe(0);
  });

  it("renova a validade quando passou da metade do TTL", async () => {
    const s = await signUp();
    if (!s.ok) throw new Error("setup");
    const createdAt = new Date(Date.now() - 20 * 24 * 3_600_000); // 20 dias atrás
    const { token, expiresAt } = await createSession(db, {
      userId: s.value.userId,
      now: createdAt,
    });

    const resolved = await resolveSession(db, { token });
    if (!resolved) throw new Error("sessão deveria resolver");
    expect(resolved.expiresAt.getTime()).toBeGreaterThan(expiresAt.getTime());
  });
});

describe("fluxo E2E (cadastro → verificação → login → painel)", () => {
  it("percorre o caminho feliz ponta a ponta", async () => {
    const s = await signUp({ email: "fluxo@empresa.com" });
    if (!s.ok) throw new Error("cadastro falhou");

    const verified = await verifyEmail(db, { token: s.value.verificationToken });
    expect(verified.ok).toBe(true);

    const first = await createSession(db, { userId: s.value.userId });
    const painel = await resolveSession(db, { token: first.token });
    expect(painel?.userId).toBe(s.value.userId);

    await destroySession(db, { token: first.token });

    const login = await logInWithPassword(db, {
      email: "fluxo@empresa.com",
      password: "senha-forte-123",
    });
    expect(login.ok).toBe(true);
    if (!login.ok) return;

    const again = await createSession(db, { userId: login.value.userId });
    expect((await resolveSession(db, { token: again.token }))?.userId).toBe(
      s.value.userId,
    );
  });
});
