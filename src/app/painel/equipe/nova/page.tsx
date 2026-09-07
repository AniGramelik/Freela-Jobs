"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { PageHeader, PageShell, Panel } from "@/components/ui/layout";

import { addProfessionalAction, type AddProfessionalState } from "../actions";

export default function NovoProfissionalPage() {
  const [state, action, pending] = useActionState<
    AddProfessionalState,
    FormData
  >(addProfessionalAction, null);

  return (
    <form action={action}>
      <PageShell>
        <PageHeader
          title="Adicionar profissional"
          meta="Cadastre alguém que você já chama para os turnos."
        />

        <Panel className="grid gap-4">
          <Field label="Nome" htmlFor="fullName">
            <Input id="fullName" name="fullName" required autoFocus />
          </Field>
          <Field label="Telefone" htmlFor="phone" hint="DDD + número">
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="(27) 99999-9999"
            />
          </Field>
          <Field label="E-mail" htmlFor="email" hint="opcional — necessário para convidar">
            <Input id="email" name="email" type="email" />
          </Field>
          <Field
            label="Funções"
            htmlFor="roles"
            hint="separadas por vírgula"
          >
            <Input id="roles" name="roles" placeholder="garçom, apoio" />
          </Field>
          <Field
            label="Nota privada"
            htmlFor="privateNote"
            hint="só a sua equipe vê"
          >
            <Textarea id="privateNote" name="privateNote" rows={2} />
          </Field>
          {state?.error ? <FormError>{state.error}</FormError> : null}
        </Panel>

        <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-end gap-2 border-t border-hairline bg-canvas/90 py-3 backdrop-blur-sm">
          <Link
            href="/painel/equipe"
            className={buttonClass("ghost", "md")}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </PageShell>
    </form>
  );
}
