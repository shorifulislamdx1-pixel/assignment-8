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
      <section className="border-b border-line/80 bg-surface/55">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-5 h-14 w-full max-w-3xl" />
          <Skeleton className="mt-3 h-14 w-full max-w-2xl" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <Skeleton className="aspect-[2/3] rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-2.5 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
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