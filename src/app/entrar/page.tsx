"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthCard } from "@/components/app/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FormError, FormStatus, Input } from "@/components/ui/field";

import {
  magicLinkAction,
  passwordLoginAction,
  type LoginState,
} from "./actions";

export default function EntrarPage() {
  const [pw, pwAction, pwPending] = useActionState<LoginState, FormData>(
    passwordLoginAction,
    null,
  );
  const [ml, mlAction, mlPending] = useActionState<LoginState, FormData>(
    magicLinkAction,
    null,
  );

  return (
    <AuthCard
      title="Entrar"
      footer={
        <>
          Não tem conta? <Link href="/cadastro">Criar conta</Link>
        </>
      }
    >
      <form action={pwAction} className="grid gap-4">
        <Field label="E-mail" htmlFor="login-email">
          <Input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </Field>
        <Field label="Senha" htmlFor="login-password">
          <Input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </Field>
        {pw?.error ? <FormError>{pw.error}</FormError> : null}
        <Button type="submit" disabled={pwPending}>
          {pwPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[0.75rem] text-fg-subtle">
        <span className="h-px flex-1 bg-hairline" />
        ou
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form action={mlAction} className="grid gap-3">
        <Field label="Link no e-mail" htmlFor="ml-email">
          <Input
            id="ml-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </Field>
        {ml?.magicLinkSent ? (
          <FormStatus>Se houver uma conta, o link chega em instantes.</FormStatus>
        ) : ml?.error ? (
          <FormError>{ml.error}</FormError>
        ) : null}
        <Button type="submit" variant="secondary" disabled={mlPending}>
          {mlPending ? "Enviando…" : "Enviar link"}
        </Button>
      </form>
    </AuthCard>
  );
}
