import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[28px] border border-border/70 bg-card/95", className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-border/80">
          <thead className="bg-accent/70">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 bg-card">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function DataRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-accent/35">{children}</tr>;
}

export function DataCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-4 align-top text-sm text-foreground", className)}>{children}</td>;
}

