"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import {
  Field,
  FormError,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { PageHeader, PageShell, Panel, SectionLabel } from "@/components/ui/layout";

import { createAndPublishJobAction, type NewJobState } from "../actions";

export default function NovaVagaPage() {
  const [state, action, pending] = useActionState<NewJobState, FormData>(
    createAndPublishJobAction,
    null,
  );

  return (
    <form action={action}>
      <PageShell>
        <PageHeader
          title="Publicar vaga"
          meta="Fica no mural até o prazo de inscrição."
        />

        <div className="grid gap-4">
          <Panel className="grid gap-4">
            <Field label="Título" htmlFor="title">
              <Input id="title" name="title" required autoFocus />
            </Field>
            <Field label="Descrição" htmlFor="description">
              <Textarea id="description" name="description" rows={4} required />
            </Field>
            <Field
              label="Categoria"
              htmlFor="categorySlug"
              hint="slug — ex.: garcom"
            >
              <Input
                id="categorySlug"
                name="categorySlug"
                required
                placeholder="garcom"
              />
            </Field>
          </Panel>

          <Panel className="grid gap-4">
            <SectionLabel>Vínculo e local</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de vínculo" htmlFor="vinculo">
                <Select id="vinculo" name="vinculo" defaultValue="DIARIA">
                  <option value="DIARIA">Diária</option>
                  <option value="TEMPORARIO">Temporário</option>
                  <option value="PJ">PJ</option>
                  <option value="CLT">CLT</option>
                  <option value="ESTAGIO">Estágio</option>
                </Select>
              </Field>
              <Field label="Local" htmlFor="locationMode">
                <Select
                  id="locationMode"
                  name="locationMode"
                  defaultValue="PRESENCIAL"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="REMOTO">Remoto</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_5rem_7rem]">
              <Field label="Cidade" htmlFor="city">
                <Input id="city" name="city" defaultValue="Colatina" />
              </Field>
              <Field label="UF" htmlFor="state">
                <Input
                  id="state"
                  name="state"
                  maxLength={2}
                  defaultValue="ES"
                  className="uppercase"
                />
              </Field>
              <Field label="Raio (km)" htmlFor="radiusKm">
                <Input
                  id="radiusKm"
                  name="radiusKm"
                  type="number"
                  min={1}
                  defaultValue={20}
                  className="tnum"
                />
              </Field>
            </div>
          </Panel>

          <Panel className="grid gap-4">
            <SectionLabel>Condições</SectionLabel>
            <Field label="Remuneração combinada" htmlFor="compensationText">
              <Input
                id="compensationText"
                name="compensationText"
                placeholder="R$ 150 a diária"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vagas" htmlFor="positions">
                <Input
                  id="positions"
                  name="positions"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="tnum"
                />
              </Field>
              <Field label="Prazo de inscrição" htmlFor="applicationDeadline">
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  required
                  className="tnum"
                />
              </Field>
            </div>
          </Panel>

          {state?.error ? <FormError>{state.error}</FormError> : null}
        </div>

        <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-end gap-2 border-t border-hairline bg-canvas/90 py-3 backdrop-blur-sm">
          <Link
            href="/painel/vagas"
            className={buttonClass("ghost", "md")}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </PageShell>
    </form>
  );
}
