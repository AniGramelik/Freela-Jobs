import { cn } from "@/lib/cn";

type Tone = "neutral" | "pos" | "neg" | "pend" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-panel-2 text-fg-muted border-hairline-strong",
  pos: "bg-pos-soft text-pos border-pos/25",
  neg: "bg-neg-soft text-neg border-neg/25",
  pend: "bg-pend-soft text-pend border-pend/25",
  brand: "bg-brand-soft text-brand border-brand/25",
};

const dot: Record<Tone, string> = {
  neutral: "bg-fg-subtle",
  pos: "bg-pos",
  neg: "bg-neg",
  pend: "bg-pend",
  brand: "bg-brand",
};

export function StatusPill({
  tone = "neutral",
  children,
  dotted = true,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dotted?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-[0.75rem] font-medium leading-5 whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dotted ? (
        <span
          className={cn("size-1.5 rounded-full", dot[tone])}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
