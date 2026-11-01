"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle className="size-7" />
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
        A page out of place
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        A page must have slipped between the shelves. Try again, or head back to
        the collection while we tidy up.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/books">Back to the collection</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 text-[10px] uppercase tracking-[0.12em] text-muted">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
