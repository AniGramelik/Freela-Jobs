import { cn } from "@/lib/cn";

/**
 * Placar de vagas — o elemento focal do detalhe da convocação.
 * Numeral grande em serifa de display; barra fina de preenchimento
 * que vira o gradiente da marca quando fecha.
 */
export function Tally({
  filled,
  total,
  label = "vagas",
  className,
}: {
  filled: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const done = total > 0 && filled >= total;
  const pct = total > 0 ? Math.min(100, (filled / total) * 100) : 0;

  return (
    <div className={cn("flex flex-col items-end gap-1.5", className)}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-display text-[2rem] leading-none font-semibold tracking-[-0.02em]",
            done ? "text-pos" : "text-fg",
          )}
        >
          {filled}
        </span>
        <span className="tnum text-lg font-medium leading-none text-fg-subtle">
          /{total}
        </span>
        <span className="ml-1 text-[0.8125rem] text-fg-subtle">{label}</span>
      </div>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-hairline">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-150 ease-out motion-reduce:transition-none",
            done ? "bg-brand-gradient" : "bg-brand",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
