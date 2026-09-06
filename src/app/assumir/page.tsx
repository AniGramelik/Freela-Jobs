"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";

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

  return (
    <main>
      <h1>Assumir seu perfil</h1>
      {!token ? (
        <p role="alert">Link sem token.</p>
      ) : !sent ? (
        <form action={reqAction}>
          <input type="hidden" name="token" value={token} />
          <p>Vamos enviar um código para o seu telefone cadastrado.</p>
          {reqState?.error ? <p role="alert">{reqState.error}</p> : null}
          <button type="submit" disabled={reqPending}>
            {reqPending ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form action={action}>
          <input type="hidden" name="token" value={token} />
          <p>
            <label>
              Código recebido{" "}
              <input name="code" inputMode="numeric" pattern="\d{6}" required />
            </label>
          </p>
          <p>
            <label>
              Seu e-mail (para acessar depois){" "}
              <input name="email" type="email" required />
            </label>
          </p>
          {state?.error ? <p role="alert">{state.error}</p> : null}
          <button type="submit" disabled={pending}>
            {pending ? "Confirmando…" : "Assumir perfil"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function AssumirPage() {
  return (
    <Suspense>
      <ClaimForm />
    </Suspense>
  );
}
