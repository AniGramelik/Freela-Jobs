"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createAndPublishJobAction, type NewJobState } from "../actions";

export default function NovaVagaPage() {
  const [state, action, pending] = useActionState<NewJobState, FormData>(
    createAndPublishJobAction,
    null,
  );

  return (
    <main>
      <h1>Publicar vaga</h1>
      <form action={action}>
        <p>
          <label>
            Título <input name="title" type="text" required />
          </label>
        </p>
        <p>
          <label>
            Descrição <textarea name="description" rows={4} required />
          </label>
        </p>
        <p>
          <label>
            Categoria (slug){" "}
            <input name="categorySlug" type="text" required placeholder="garcom" />
          </label>
        </p>
        <p>
          <label>
            Tipo de vínculo{" "}
            <select name="vinculo" defaultValue="DIARIA">
              <option value="DIARIA">Diária</option>
              <option value="TEMPORARIO">Temporário</option>
              <option value="PJ">PJ</option>
              <option value="CLT">CLT</option>
              <option value="ESTAGIO">Estágio</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            Local{" "}
            <select name="locationMode" defaultValue="PRESENCIAL">
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="REMOTO">Remoto</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            Cidade <input name="city" type="text" defaultValue="Colatina" />
          </label>{" "}
          <label>
            UF <input name="state" type="text" maxLength={2} defaultValue="ES" />
          </label>
        </p>
        <p>
          <label>
            Raio (km){" "}
            <input name="radiusKm" type="number" min={1} defaultValue={20} />
          </label>
        </p>
        <p>
          <label>
            Remuneração combinada{" "}
            <input name="compensationText" type="text" placeholder="R$ 150 a diária" />
          </label>
        </p>
        <p>
          <label>
            Vagas{" "}
            <input name="positions" type="number" min={1} defaultValue={1} />
          </label>
        </p>
        <p>
          <label>
            Prazo de inscrição{" "}
            <input name="applicationDeadline" type="date" required />
          </label>
        </p>
        {state?.error ? <p role="alert">{state.error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </form>
      <p>
        <Link href="/painel/vagas">Cancelar</Link>
      </p>
    </main>
  );
}
