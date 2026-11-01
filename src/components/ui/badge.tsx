import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-brand-foreground",
        secondary: "border-line bg-surface-muted text-muted",
        outline: "border-line bg-transparent text-muted",
        soft: "border-brand/15 bg-brand-soft text-brand",
        gold: "border-gold/20 bg-gold-soft text-gold",
        danger: "border-danger/20 bg-danger-soft text-danger",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
