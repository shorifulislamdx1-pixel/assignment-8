import Link from "next/link";
import { ArrowLeft, BookOpen, LibraryBig, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[480px] -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
        <div className="relative">
          <div className="absolute -left-12 top-8 w-16 -rotate-12 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-xl">
            <img
              src="/covers/pride-and-prejudice.jpg"
              alt=""
              className="aspect-[2/3] w-full rounded object-cover"
            />
          </div>
          <div className="absolute -right-12 top-10 w-16 rotate-12 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-xl">
            <img
              src="/covers/dune.jpg"
              alt=""
              className="aspect-[2/3] w-full rounded object-cover"
            />
          </div>
          <div className="grid size-20 place-items-center rounded-2xl border border-line bg-surface text-brand shadow-xl">
            <LibraryBig className="size-8" />
          </div>
        </div>

        <p className="mt-8 font-display text-7xl font-semibold leading-none tracking-[-0.06em] text-brand">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
          This shelf is empty.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          The page you were looking for may have been moved, returned, or never
          placed on the shelf at all. Let us find you a better story.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft />
              Back home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/books">
              <Search />
              Browse books
            </Link>
          </Button>
        </div>

        <p className="mt-8 flex items-center gap-2 text-[11px] text-muted">
          <BookOpen className="size-3.5 text-brand" />
          There are plenty more pages to turn.
        </p>
      </div>
    </div>
  );
}
