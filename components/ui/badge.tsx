import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "border-border bg-accent text-accent-foreground",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
        muted: "border-border/60 bg-white/70 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

