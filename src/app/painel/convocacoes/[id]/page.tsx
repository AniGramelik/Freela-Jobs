import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

import {
  attendanceAction,
  cancelCallOutAction,
  rateAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function ConvocacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyContext();
  const { id } = await params;

  const callout = await prisma.callOut.findUnique({
    where: { id },
    include: {
      responses: {
        include: {
          professionalProfile: { select: { id: true, fullName: true, phoneE164: true } },
        },
      },
    },
  });
  if (!callout || callout.companyId !== company.id) notFound();

  return (
    <main>
      <h1>
        {callout.role} — {callout.shiftDate.toLocaleDateString("pt-BR")}{" "}
        {callout.shiftStart}
      </h1>
      <p>
        {callout.location} · {callout.mode} · {callout.status} ·{" "}
        {callout.quantity} vaga(s)
        {callout.compensationText ? ` · ${callout.compensationText}` : ""}
      </p>

      {callout.status !== "CANCELLED" ? (
        <form action={cancelCallOutAction}>
          <input type="hidden" name="callOutId" value={callout.id} />
          <button type="submit">Cancelar convocação</button>
        </form>
      ) : null}

      <h2>Respostas</h2>
      <table>
        <thead>
          <tr>
            <th>Profissional</th>
            <th>Telefone</th>
            <th>Estado</th>
            <th>Presença</th>
            <th>Avaliar</th>
          </tr>
        </thead>
        <tbody>
          {callout.responses.map((r) => (
            <tr key={r.id}>
              <td>{r.professionalProfile.fullName}</td>
              <td>{r.professionalProfile.phoneE164}</td>
              <td>{r.state}</td>
              <td>
                {r.state === "ACCEPTED" ? (
                  <>
                    <form action={attendanceAction} style={{ display: "inline" }}>
                      <input type="hidden" name="callOutId" value={callout.id} />
                      <input
                        type="hidden"
                        name="professionalProfileId"
                        value={r.professionalProfile.id}
                      />
                      <input type="hidden" name="outcome" value="COMPLETED" />
                      <button type="submit">Compareceu</button>
                    </form>
                    <form action={attendanceAction} style={{ display: "inline" }}>
                      <input type="hidden" name="callOutId" value={callout.id} />
                      <input
                        type="hidden"
                        name="professionalProfileId"
                        value={r.professionalProfile.id}
                      />
                      <input type="hidden" name="outcome" value="NO_SHOW" />
                      <button type="submit">Faltou</button>
                    </form>
                  </>
                ) : (
                  (r.state === "COMPLETED" && "compareceu") ||
                  (r.state === "NO_SHOW" && "faltou") ||
                  "—"
                )}
              </td>
              <td>
                <form action={rateAction} style={{ display: "inline" }}>
                  <input type="hidden" name="callOutId" value={callout.id} />
                  <input
                    type="hidden"
                    name="professionalProfileId"
                    value={r.professionalProfile.id}
                  />
                  <select name="score" defaultValue="5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <input name="comment" type="text" placeholder="nota interna" />
                  <button type="submit">Salvar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <Link href="/painel/convocacoes">Voltar</Link>
      </p>
    </main>
  );
}
