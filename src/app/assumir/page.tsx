"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";

import { AuthCard } from "@/components/app/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

import {
  completeClaimAction,
  requestOtpAction,
  type ClaimState,
} from "./actions";

function ClaimForm() {
  const token = useSearchParams().get("token") ?? "";
  const [reqState, reqAction, reqPending] = useActionState<ClaimState, FormData>(
    requestOtpAction,
    null,
  );
  const [state, action, pending] = useActionState<ClaimState, FormData>(
    completeClaimAction,
    null,
  );
  const sent = reqState?.codeSent;

  if (!token) {
    return (
      <AuthCard title="Assumir seu perfil">
        <FormError>Link sem token.</FormError>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Assumir seu perfil"
      hint={
        sent
          ? "Digite o código que enviamos e escolha o e-mail de acesso."
          : "Vamos enviar um código para o telefone do seu cadastro."
      }
    >
      {!sent ? (
        <form action={reqAction} className="grid gap-3">
          <input type="hidden" name="token" value={token} />
          {reqState?.error ? <FormError>{reqState.error}</FormError> : null}
          <Button type="submit" disabled={reqPending}>
            {reqPending ? "Enviando…" : "Enviar código"}
          </Button>
        </form>
      ) : (
        <form action={action} className="grid gap-4">
          <input type="hidden" name="token" value={token} />
          <Field label="Código recebido" htmlFor="code">
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="\d{6}"
              required
              autoFocus
              className="tnum tracking-[0.3em]"
            />
          </Field>
          <Field label="Seu e-mail" htmlFor="claim-email" hint="para acessar depois">
            <Input id="claim-email" name="email" type="email" required />
          </Field>
          {state?.error ? <FormError>{state.error}</FormError> : null}
          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "Confirmando…" : "Assumir perfil"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function AssumirPage() {
  return (
    <Suspense>
      <ClaimForm />
    </Suspense>
  );
}
