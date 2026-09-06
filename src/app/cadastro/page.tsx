"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type SignUpState } from "./actions";

export default function CadastroPage() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    null,
  );

  return (
    <main>
      <h1>Criar conta da empresa</h1>
      <form action={action}>
        <p>
          <label>
            Nome da empresa
            <input name="companyName" type="text" required />
          </label>
        </p>
        <p>
          <label>
            E-mail
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </p>
        <p>
          <label>
            Senha (mín. 8 caracteres)
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        </p>
        {state?.error ? <p role="alert">{state.error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Criando…" : "Criar conta"}
        </button>
      </form>
      <p>
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}
