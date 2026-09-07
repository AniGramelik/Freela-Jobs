import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Coluna de conteúdo com largura de leitura. */
export function PageShell({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "fj-rise mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
        wide ? "max-w-6xl" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  meta,
  actions,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pb-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-fg">
          {title}
        </h1>
        {meta ? (
          <div className="mt-1.5 text-sm text-fg-muted">{meta}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-hairline bg-panel shadow-sm",
        padded && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 text-[0.8125rem] font-semibold tracking-[0.01em] text-fg-muted">
      {children}
    </h2>
  );
}

export function EmptyState({
  icon,
  illustration,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  illustration?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-hairline-strong bg-brand-gradient-soft px-6 py-14 text-center">
      {illustration ? (
        <div className="mb-1 text-brand">{illustration}</div>
      ) : icon ? (
        <div className="grid size-11 place-items-center rounded-full border border-hairline bg-panel text-brand shadow-sm">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-base font-semibold text-fg">{title}</p>
      {hint ? (
        <p className="max-w-xs text-[0.8125rem] leading-relaxed text-fg-subtle">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
