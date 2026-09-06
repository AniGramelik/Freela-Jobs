"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveAddressAction, type AddressState } from "./actions";

export default function EmpresaPage() {
  const [state, action, pending] = useActionState<AddressState, FormData>(
    saveAddressAction,
    null,
  );

  return (
    <main>
      <h1>Endereço da empresa</h1>
      <p>Usado para calcular a distância nas convocações e vagas presenciais.</p>
      <form action={action}>
        <p>
          <label>
            Endereço <input name="line" type="text" required />
          </label>
        </p>
        <p>
          <label>
            Bairro <input name="district" type="text" />
          </label>
        </p>
        <p>
          <label>
            Cidade <input name="city" type="text" required defaultValue="Colatina" />
          </label>
        </p>
        <p>
          <label>
            UF <input name="state" type="text" required maxLength={2} defaultValue="ES" />
          </label>
        </p>
        <p>
          <label>
            CEP <input name="zip" type="text" />
          </label>
        </p>
        <p>
          <label>
            Raio padrão (km){" "}
            <input name="radiusKm" type="number" min={1} defaultValue={20} />
          </label>
        </p>
        {state?.error ? <p role="alert">{state.error}</p> : null}
        {state?.warning ? <p role="status">{state.warning}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar endereço"}
        </button>
      </form>
      <p>
        <Link href="/painel">Voltar</Link>
      </p>
    </main>
  );
}
