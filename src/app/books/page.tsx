import type { Metadata } from "next";
import { Suspense } from "react";
import BooksExplorer from "@/components/books/BooksExplorer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Explore the collection",
  description:
    "Browse every book on the BookNook community shelf. Search by title, author, or category and find your next read.",
};

function BooksFallback() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70 bg-gradient-to-br from-surface via-surface/90 to-primary/5">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-1 w-8 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>

          <Skeleton className="h-12 w-full max-w-3xl rounded-xl sm:h-16" />
          <Skeleton className="mt-3 h-12 w-full max-w-2xl rounded-xl sm:h-16" />

          <Skeleton className="mt-6 h-4 w-full max-w-xl rounded-full" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-md rounded-full" />

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-full" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <Skeleton className="aspect-[2/3] rounded-none" />

              <div className="space-y-3 p-5">
                <Skeleton className="h-2.5 w-1/3 rounded-full" />
                <Skeleton className="h-5 w-4/5 rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-full" />

                <div className="flex items-center justify-between border-t border-line/60 pt-4">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksFallback />}>
      <BooksExplorer />
    </Suspense>
  );
}