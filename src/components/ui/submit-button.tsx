"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonClass } from "./button";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

/**
 * Botão de submit dentro de um <form action={serverAction}>. Enquanto a ação
 * roda, mostra o estado pendente — o placar e as pílulas só atualizam quando o
 * servidor responde e revalida, então o feedback imediato vem daqui.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
