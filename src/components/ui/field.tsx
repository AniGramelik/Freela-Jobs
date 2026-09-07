import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border border-hairline-strong bg-panel px-3 text-sm text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-150 " +
  "focus:border-brand focus:outline-2 focus:outline-offset-[-1px] focus:outline-[var(--color-ring)] " +
  "disabled:opacity-50 disabled:bg-panel-2";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-9", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(control, "min-h-20 py-2 leading-6", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(control, "h-9 appearance-none bg-no-repeat pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.65rem center",
      }}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[0.8125rem] font-medium text-fg-muted"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[0.8125rem] text-neg">{error}</p>
      ) : hint ? (
        <p className="text-[0.8125rem] text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-neg/30 bg-neg-soft px-3 py-2 text-[0.8125rem] text-neg"
    >
      {children}
    </p>
  );
}

export function FormStatus({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-md border border-pos/30 bg-pos-soft px-3 py-2 text-[0.8125rem] text-pos"
    >
      {children}
    </p>
  );
}
