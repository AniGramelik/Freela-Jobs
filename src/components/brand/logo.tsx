import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Marca Freela Jobs. `mark` = só o símbolo (figura em avanço, "f" +
 * pessoa + impulso); `full` = símbolo + logotipo "freela Jobs".
 *
 * As cores vêm de `--logo-ink` / `--logo-teal`, que caem para os tokens
 * da marca por padrão mas podem ser forçadas (ex.: branco sobre o
 * gradiente da capa).
 */

type LogoProps = {
  variant?: "mark" | "full";
  /** altura do símbolo em px */
  size?: number;
  className?: string;
  /** sobrescreve as duas cores (ex.: "#fff" nos dois sobre o gradiente) */
  tone?: "brand" | "onDark" | "mono";
  title?: string;
};

const TONES: Record<
  NonNullable<LogoProps["tone"]>,
  { "--logo-ink": string; "--logo-teal": string }
> = {
  brand: {
    "--logo-ink": "var(--color-ink)",
    "--logo-teal": "var(--color-brand)",
  },
  onDark: {
    "--logo-ink": "#ffffff",
    "--logo-teal": "var(--color-brand)",
  },
  mono: {
    "--logo-ink": "currentColor",
    "--logo-teal": "currentColor",
  },
};

export function LogoMark({
  size = 28,
  className,
  tone = "brand",
  title = "Freela Jobs",
}: Omit<LogoProps, "variant">) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
      style={TONES[tone] as CSSProperties}
    >
      {/* impulso: fita que sobe da base à direita (braço / movimento) */}
      <path
        d="M4 27.5c7.4 1.7 14.6-.2 21-6 2.8-2.5 4.8-4.6 8.7-5.8l1.9 6.2c-2.7.8-3.9 1.8-5.9 3.6-7.4 6.7-16.4 9.6-25.7 8.1Z"
        fill="var(--logo-teal)"
      />
      {/* corpo: haste do "f" / tronco da figura */}
      <path
        d="M15 13.2C15 8.7 18.6 5 23.2 5H27v6.1h-3.3c-1.4 0-2.1.9-2.1 2.6V16H26v6h-4.4v13h-6.6V22H12v-6h3v-2.8Z"
        fill="var(--logo-ink)"
      />
      {/* cabeça */}
      <circle cx="29.3" cy="8.9" r="4.9" fill="var(--logo-teal)" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = 28,
  className,
  tone = "brand",
  title = "Freela Jobs",
}: LogoProps) {
  if (variant === "mark") {
    return (
      <LogoMark size={size} className={className} tone={tone} title={title} />
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}
    >
      <LogoMark size={size} tone={tone} title="" />
      <span
        className="font-display font-semibold tracking-[-0.02em] text-fg"
        style={{ fontSize: size * 0.72, lineHeight: 1 }}
      >
        <span className="lowercase">freela</span>
        <span className="ml-[0.14em] font-sans font-semibold text-brand">
          Jobs
        </span>
      </span>
    </span>
  );
}
