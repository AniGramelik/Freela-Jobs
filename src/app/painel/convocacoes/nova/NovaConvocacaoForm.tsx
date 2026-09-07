"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createCallOutAction, type NewCallOutState } from "../actions";

type Target = { profileId: string; fullName: string; roles: string[] };

export function NovaConvocacaoForm({
  targets,
}: {
  targets: Target[];
}) {
  const [state, action, pending] = useActionState<NewCallOutState, FormData>(
    createCallOutAction,
    null,
  );

  return (
    <main>
      <h1>Nova convocação</h1>
      <form action={action}>
        <p>
          <label>
            Função <input name="role" type="text" required placeholder="garçom" />
          </label>
        </p>
        <p>
          <label>
            Data <input name="shiftDate" type="date" required />
          </label>{" "}
          <label>
            Início <input name="shiftStart" type="time" required />
          </label>{" "}
          <label>
            Fim <input name="shiftEnd" type="time" />
          </label>
        </p>
        <p>
          <label>
            Local <input name="location" type="text" required />
          </label>
        </p>
        <p>
          <label>
            Vagas <input name="quantity" type="number" min={1} defaultValue={1} />
          </label>
        </p>
        <p>
          <label>
            Remuneração combinada <input name="compensationText" type="text" />
          </label>
        </p>
        <p>
          <label>
            Observações <input name="notes" type="text" />
          </label>
        </p>
        <fieldset>
          <legend>Modo</legend>
          <label>
            <input type="radio" name="mode" value="TARGETED" defaultChecked /> Chamar
            nominalmente
          </label>
          <label>
            <input type="radio" name="mode" value="OPEN" /> Aberta (função + raio)
          </label>
          <label>
            Raio (km){" "}
            <input name="radiusKm" type="number" min={1} defaultValue={20} />
          </label>
        </fieldset>
        <fieldset>
          <legend>Destinatários (modo nominal)</legend>
          {targets.length === 0 ? (
            <p>Cadastre profissionais na Equipe primeiro.</p>
          ) : (
            targets.map((t) => (
              <label key={t.profileId} style={{ display: "block" }}>
                <input type="checkbox" name="target" value={t.profileId} />{" "}
                {t.fullName} {t.roles.length ? `(${t.roles.join(", ")})` : ""}
              </label>
            ))
          )}
        </fieldset>
        {state?.error ? <p role="alert">{state.error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Publicando…" : "Publicar convocação"}
        </button>
      </form>
      <p>
        <Link href="/painel/convocacoes">Cancelar</Link>
      </p>
    </main>
  );
}
