import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="surface-dots overflow-hidden">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

