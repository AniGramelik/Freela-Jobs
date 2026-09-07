"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import {
  Field,
  FormError,
  FormStatus,
  Input,
} from "@/components/ui/field";
import { PageHeader, PageShell, Panel } from "@/components/ui/layout";

import { saveAddressAction, type AddressState } from "./actions";

export default function EmpresaPage() {
  const [state, action, pending] = useActionState<AddressState, FormData>(
    saveAddressAction,
    null,
  );

  return (
    <form action={action}>
      <PageShell>
        <PageHeader
          title="Empresa"
          meta="Endereço usado para calcular distância em convocações e vagas presenciais."
        />

        <Panel className="grid gap-4">
          <Field label="Endereço" htmlFor="line">
            <Input id="line" name="line" required autoFocus />
          </Field>
          <Field label="Bairro" htmlFor="district">
            <Input id="district" name="district" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_5rem]">
            <Field label="Cidade" htmlFor="city">
              <Input id="city" name="city" required defaultValue="Colatina" />
            </Field>
            <Field label="UF" htmlFor="state">
              <Input
                id="state"
                name="state"
                required
                maxLength={2}
                defaultValue="ES"
                className="uppercase"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CEP" htmlFor="zip">
              <Input id="zip" name="zip" inputMode="numeric" />
            </Field>
            <Field label="Raio padrão (km)" htmlFor="radiusKm">
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
          {state?.error ? <FormError>{state.error}</FormError> : null}
          {state?.warning ? <FormStatus>{state.warning}</FormStatus> : null}
        </Panel>

        <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-end gap-2 border-t border-hairline bg-canvas/90 py-3 backdrop-blur-sm">
          <Link href="/painel" className={buttonClass("ghost", "md")}>
            Voltar
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar endereço"}
          </Button>
        </div>
      </PageShell>
    </form>
  );
}
