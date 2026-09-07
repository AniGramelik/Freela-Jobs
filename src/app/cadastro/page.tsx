"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthCard } from "@/components/app/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

import { signUpAction, type SignUpState } from "./actions";

export default function CadastroPage() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    null,
  );

  return (
    <AuthCard
      title="Criar conta da empresa"
      hint="Você é o primeiro responsável (OWNER). Confirma o e-mail e já entra."
      footer={
        <>
          Já tem conta? <Link href="/entrar">Entrar</Link>
        </>
      }
    >
      <form action={action} className="grid gap-4">
        <Field label="Nome da empresa" htmlFor="companyName">
          <Input id="companyName" name="companyName" required autoFocus />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </Field>
        <Field label="Senha" htmlFor="password" hint="mínimo 8 caracteres">
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        {state?.error ? <FormError>{state.error}</FormError> : null}
        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Criando…" : "Criar conta"}
        </Button>
      </form>
    </AuthCard>
  );
}
