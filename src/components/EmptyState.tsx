import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        {icon || <BookOpen className="size-6" />}
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children}
    </div>
  );
}
