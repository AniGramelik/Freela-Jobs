import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-panel shadow-sm">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-hairline bg-panel-2 text-left">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-hairline">{children}</tbody>
  );
}

export function TR({
  children,
  className,
  focused = false,
}: {
  children: ReactNode;
  className?: string;
  focused?: boolean;
}) {
  return (
    <tr
      className={cn(
        "transition-colors",
        focused ? "bg-brand-soft/60" : "hover:bg-panel-2",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <th
      className={cn(
        "px-3.5 py-2.5 text-[0.75rem] font-semibold text-fg-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td
      className={cn("px-3.5 py-3 align-middle text-fg", className)}
      {...props}
    >
      {children}
    </td>
  );
}
