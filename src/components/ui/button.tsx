import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "brand-gradient";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium " +
  "whitespace-nowrap transition-[background,color,box-shadow,transform] duration-150 select-none " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-fg-onbrand shadow-[inset_0_1px_0_oklch(1_0_0/0.14)] " +
    "hover:bg-brand-hover hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.2),0_1px_10px_-2px_var(--color-brand)]",
  secondary:
    "bg-panel text-fg border border-hairline-strong hover:bg-panel-2 hover:border-hairline",
  ghost: "text-fg-muted hover:bg-panel-2 hover:text-fg",
  danger: "bg-neg text-white hover:brightness-95",
  "brand-gradient":
    "bg-brand-gradient text-white shadow-md " +
    "hover:brightness-[1.06] hover:-translate-y-px active:translate-y-0",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[0.8125rem]",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-[0.9375rem]",
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
