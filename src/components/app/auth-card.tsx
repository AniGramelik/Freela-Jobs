import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  hint,
  children,
  footer,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-14">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="grid size-6 place-items-center rounded-md bg-brand text-[0.7rem] font-bold text-fg-onbrand">
          F
        </span>
        <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
          Freela Jobs
        </span>
      </Link>

      <h1 className="mt-8 text-xl font-semibold tracking-[-0.015em] text-fg">
        {title}
      </h1>
      {hint ? (
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-fg-muted">
          {hint}
        </p>
      ) : null}

      <div className="mt-6">{children}</div>

      {footer ? (
        <p className="mt-6 text-[0.8125rem] text-fg-muted">{footer}</p>
      ) : null}
    </main>
  );
}
