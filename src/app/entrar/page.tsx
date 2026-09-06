"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  magicLinkAction,
  passwordLoginAction,
  type LoginState,
} from "./actions";

export default function EntrarPage() {
  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(
    passwordLoginAction,
    null,
  );
  const [mlState, mlAction, mlPending] = useActionState<LoginState, FormData>(
    magicLinkAction,
    null,
  );

  return (
    <main>
      <h1>Entrar</h1>

      <form action={pwAction}>
        <h2>Com e-mail e senha</h2>
        <p>
          <label>
            E-mail
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </p>
        <p>
          <label>
            Senha
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
        </p>
        {pwState?.error ? <p role="alert">{pwState.error}</p> : null}
        <button type="submit" disabled={pwPending}>
          {pwPending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <form action={mlAction}>
        <h2>Ou por link no e-mail</h2>
        <p>
          <label>
            E-mail
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </p>
        {mlState?.magicLinkSent ? (
          <p role="status">Se houver uma conta, o link chega em instantes.</p>
        ) : null}
        {mlState?.error ? <p role="alert">{mlState.error}</p> : null}
        <button type="submit" disabled={mlPending}>
          {mlPending ? "Enviando…" : "Enviar link"}
        </button>
      </form>

      <p>
        Não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </main>
  );
}
