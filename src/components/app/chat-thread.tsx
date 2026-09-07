"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";

export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

/**
 * Fio de conversa. Sem push em tempo real (mesma limitação do placar da
 * convocação): revalida no envio e dá `router.refresh()` a cada 15 s
 * enquanto a aba está visível.
 */
export function ChatThread({
  messages,
  sendAction,
  hiddenFields,
  disabled,
  disabledNote,
}: {
  messages: ThreadMessage[];
  sendAction: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-2.5 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-[0.8125rem] text-fg-subtle">
            Nenhuma mensagem ainda. Escreva a primeira.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.mine ? "justify-end" : "justify-start",
                i === messages.length - 1 && "fj-land rounded-lg",
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-[0.875rem] leading-relaxed whitespace-pre-wrap",
                  m.mine
                    ? "bg-brand text-fg-onbrand rounded-br-md"
                    : "border border-hairline bg-panel text-fg rounded-bl-md",
                )}
              >
                {m.body}
                <span
                  className={cn(
                    "mt-1 block text-[0.6875rem]",
                    m.mine ? "text-white/60" : "text-fg-subtle",
                  )}
                >
                  {new Date(m.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {disabled ? (
        <p className="border-t border-hairline py-3 text-center text-[0.8125rem] text-fg-subtle">
          {disabledNote ?? "Esta conversa está fechada."}
        </p>
      ) : (
        <form
          ref={formRef}
          action={sendAction}
          onSubmit={() => {
            // limpa o campo logo após o submit da server action
            window.setTimeout(() => formRef.current?.reset(), 0);
          }}
          className="flex items-end gap-2 border-t border-hairline pt-3"
        >
          {hiddenFields
            ? Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))
            : null}
          <textarea
            name="body"
            required
            rows={1}
            placeholder="Escreva uma mensagem…"
            className="max-h-40 min-h-10 flex-1 resize-y rounded-lg border border-hairline-strong bg-panel px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-2 focus:outline-offset-[-1px] focus:outline-[var(--color-ring)]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <SubmitButton variant="primary" size="md" pendingLabel="Enviando…">
            Enviar
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
