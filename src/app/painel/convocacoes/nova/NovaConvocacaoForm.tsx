"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/field";
import { PageHeader, PageShell, Panel, SectionLabel } from "@/components/ui/layout";

import { createCallOutAction, type NewCallOutState } from "../actions";

type Target = { profileId: string; fullName: string; roles: string[] };

export function NovaConvocacaoForm({ targets }: { targets: Target[] }) {
  const [state, action, pending] = useActionState<NewCallOutState, FormData>(
    createCallOutAction,
    null,
  );

  return (
    <form action={action}>
      <PageShell>
        <PageHeader
          title="Nova convocação"
          meta="Publica direto — a equipe é notificada na hora."
        />

        <div className="grid gap-5">
          <Panel>
            <div className="grid gap-4">
              <Field label="Função" htmlFor="role">
                <Input id="role" name="role" required placeholder="garçom" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Data" htmlFor="shiftDate">
                  <Input id="shiftDate" name="shiftDate" type="date" required />
                </Field>
                <Field label="Início" htmlFor="shiftStart">
                  <Input
                    id="shiftStart"
                    name="shiftStart"
                    type="time"
                    required
                  />
                </Field>
                <Field label="Fim" htmlFor="shiftEnd" hint="opcional">
                  <Input id="shiftEnd" name="shiftEnd" type="time" />
                </Field>
              </div>
              <Field label="Local" htmlFor="location">
                <Input id="location" name="location" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Vagas" htmlFor="quantity">
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={1}
                  />
                </Field>
                <Field
                  label="Remuneração combinada"
                  htmlFor="compensationText"
                  hint="texto livre"
                >
                  <Input
                    id="compensationText"
                    name="compensationText"
                    placeholder="R$ 150 a diária"
                  />
                </Field>
              </div>
              <Field label="Observações" htmlFor="notes" hint="opcional">
                <Input id="notes" name="notes" />
              </Field>
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Modo</SectionLabel>
            <div className="grid gap-2.5 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="TARGETED"
                  defaultChecked
                  className="accent-[var(--color-brand)]"
                />
                Chamar nominalmente
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="OPEN"
                  className="accent-[var(--color-brand)]"
                />
                Aberta — por função + raio
              </label>
              <label className="mt-1 flex items-center gap-2 text-fg-muted">
                Raio (km)
                <Input
                  name="radiusKm"
                  type="number"
                  min={1}
                  defaultValue={20}
                  className="h-8 w-20"
                />
              </label>
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Destinatários — modo nominal</SectionLabel>
            {targets.length === 0 ? (
              <p className="text-[0.8125rem] text-fg-subtle">
                Cadastre profissionais na Equipe primeiro.
              </p>
            ) : (
              <ul className="grid gap-1.5">
                {targets.map((t) => (
                  <li key={t.profileId}>
                    <label className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-panel-2">
                      <input
                        type="checkbox"
                        name="target"
                        value={t.profileId}
                        className="accent-[var(--color-brand)]"
                      />
                      <span className="font-medium">{t.fullName}</span>
                      {t.roles.length ? (
                        <span className="text-[0.8125rem] text-fg-subtle">
                          {t.roles.join(", ")}
                        </span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {state?.error ? <FormError>{state.error}</FormError> : null}
        </div>
      </PageShell>

      <div className="sticky bottom-0 z-10 border-t border-hairline bg-panel/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/painel/convocacoes"
            className="text-[0.8125rem] font-medium text-fg-muted no-underline hover:text-fg"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Publicando…" : "Publicar convocação"}
          </Button>
        </div>
      </div>
    </form>
  );
}
