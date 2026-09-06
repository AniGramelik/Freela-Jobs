"use client";

import Link from "next/link";
import { useActionState } from "react";

import { addProfessionalAction, type AddProfessionalState } from "../actions";

export default function NovoProfissionalPage() {
  const [state, action, pending] = useActionState<
    AddProfessionalState,
    FormData
  >(addProfessionalAction, null);

  return (
    <main>
      <h1>Adicionar profissional</h1>
      <form action={action}>
        <p>
          <label>
            Nome
            <input name="fullName" type="text" required />
          </label>
        </p>
        <p>
          <label>
            Telefone (DDD + número)
            <input name="phone" type="tel" required placeholder="(27) 99999-9999" />
          </label>
        </p>
        <p>
          <label>
            E-mail (opcional)
            <input name="email" type="email" />
          </label>
        </p>
        <p>
          <label>
            Funções (separadas por vírgula)
            <input name="roles" type="text" placeholder="garçom, apoio" />
          </label>
        </p>
        <p>
          <label>
            Nota privada (só a sua equipe vê)
            <textarea name="privateNote" rows={2} />
          </label>
        </p>
        {state?.error ? <p role="alert">{state.error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </form>
      <p>
        <Link href="/painel/equipe">Cancelar</Link>
      </p>
    </main>
  );
}
