import { revalidatePath } from "next/cache";
import { MapPin, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { respondToCallOut } from "@/use-cases/callouts";

export const dynamic = "force-dynamic";

export default async function ProfConvocacoesPage() {
  const { professionalProfileId } = await requireProfessional();

  const responses = await prisma.callOutResponse.findMany({
    where: {
      professionalProfileId,
      state: { in: ["OFFERED", "ACCEPTED"] },
      callOut: { status: { in: ["OPEN", "FILLED"] } },
    },
    include: {
      callOut: {
        select: {
          id: true,
          role: true,
          shiftDate: true,
          shiftStart: true,
          shiftEnd: true,
          location: true,
          compensationText: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function respond(formData: FormData) {
    "use server";
    const { professionalProfileId: pid } = await requireProfessional();
    await respondToCallOut(prisma, {
      callOutId: String(formData.get("callOutId")),
      professionalProfileId: pid,
      action: formData.get("action") as "accept" | "decline" | "withdraw",
    });
    revalidatePath("/prof/convocacoes");
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-lg font-semibold tracking-[-0.01em]">
        Convocações
      </h1>

      {responses.length === 0 ? (
        <EmptyState
          icon={<Radio size={18} strokeWidth={1.75} />}
          title="Nada agora"
          hint="Quando uma empresa te chamar, aparece aqui."
        />
      ) : (
        <ul className="grid gap-3">
          {responses.map((r) => {
            const c = r.callOut;
            return (
              <li
                key={r.id}
                className="rounded-lg border border-hairline bg-panel p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.75rem] font-medium text-fg-subtle">
                      {c.company.name}
                    </p>
                    <p className="mt-0.5 text-base font-semibold">{c.role}</p>
                  </div>
                  {r.state === "ACCEPTED" ? (
                    <StatusPill tone="brand">Você topou</StatusPill>
                  ) : null}
                </div>

                <dl className="tnum mt-3 grid gap-1 text-[0.8125rem] text-fg-muted">
                  <div className="flex gap-1.5">
                    <dt className="text-fg-subtle">Quando</dt>
                    <dd>
                      {c.shiftDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      · {c.shiftStart}
                      {c.shiftEnd ? `–${c.shiftEnd}` : ""}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={1.75} aria-hidden />
                    {c.location}
                  </div>
                  {c.compensationText ? (
                    <div className="flex gap-1.5">
                      <dt className="text-fg-subtle">Combinado</dt>
                      <dd>{c.compensationText}</dd>
                    </div>
                  ) : null}
                </dl>

                {r.state === "OFFERED" ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <form action={respond}>
                      <input type="hidden" name="callOutId" value={c.id} />
                      <input type="hidden" name="action" value="accept" />
                      <Button
                        type="submit"
                        className="h-11 w-full text-[0.9375rem]"
                      >
                        Topar
                      </Button>
                    </form>
                    <form action={respond}>
                      <input type="hidden" name="callOutId" value={c.id} />
                      <input type="hidden" name="action" value="decline" />
                      <Button
                        type="submit"
                        variant="secondary"
                        className="h-11 w-full text-[0.9375rem]"
                      >
                        Passar
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form action={respond} className="mt-4">
                    <input type="hidden" name="callOutId" value={c.id} />
                    <input type="hidden" name="action" value="withdraw" />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-10 w-full"
                    >
                      Desistir
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
