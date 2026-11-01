"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

interface AuthShellProps {
  heading?: string;
  subheading?: string;
  children: React.ReactNode;
}

export default function AuthShell({
  heading,
  subheading,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-line bg-surface p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-md transition-transform hover:scale-105"
          >
            <BookOpen className="size-6" />
          </Link>
          {heading && (
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-xs text-muted sm:text-sm">{subheading}</p>
          )}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}