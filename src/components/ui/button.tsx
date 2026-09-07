import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium " +
  "whitespace-nowrap transition-colors duration-150 select-none " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-fg-onbrand hover:bg-brand-hover shadow-[inset_0_1px_0_oklch(1_0_0/0.12)]",
  secondary:
    "bg-panel text-fg border border-hairline-strong hover:bg-panel-2",
  ghost: "text-fg-muted hover:bg-panel-2 hover:text-fg",
  danger: "bg-neg text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[0.8125rem]",
  md: "h-9 px-3.5 text-sm",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  extra?: string,
): string {
  return cn(base, variants[variant], sizes[size], extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button className={buttonClass(variant, size, className)} {...props} />
  );
}
