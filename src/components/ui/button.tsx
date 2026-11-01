import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground shadow-[0_12px_30px_-16px_var(--brand)] hover:bg-brand-strong hover:-translate-y-0.5",
        secondary:
          "bg-brand-soft text-ink hover:bg-brand-soft-strong",
        outline:
          "border border-line bg-transparent text-ink hover:border-brand/40 hover:bg-surface-muted",
        ghost: "text-ink hover:bg-surface-muted",
        destructive:
          "bg-red-600 text-white shadow-[0_12px_30px_-16px_rgba(220,38,38,.8)] hover:bg-red-500",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-sm",
        icon: "size-10 p-0",
        "icon-sm": "size-8 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
