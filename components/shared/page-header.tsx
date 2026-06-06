import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Personal CRM
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button asChild className="w-full md:w-auto">
          <Link href={actionHref}>
            <Plus className="size-4" />
            {actionLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

