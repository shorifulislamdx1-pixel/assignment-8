import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted/70 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/15",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
