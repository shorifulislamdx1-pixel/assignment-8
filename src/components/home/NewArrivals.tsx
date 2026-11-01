"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { Book } from "@/types";

export default function NewArrivals() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Book[]>("/books?sort=newest&limit=6", {
          auth: false,
        });
        if (active) setBooks(data);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load new arrivals."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBooks();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            <Sparkles className="size-3.5" />
            Just landed
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
            New on the shelf
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
            The latest additions from our community. A few fresh stories,
            ideas, and worlds to get lost in.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit shrink-0">
          <Link href="/books">
            View all books
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <Skeleton className="aspect-[2/3] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-2.5 w-1/3" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              The shelf is playing hide and seek.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {error}
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw />
              Try again
            </Button>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              The new arrivals shelf is waiting.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Be the first to add a book and start this shelf.
            </p>
            <Button asChild className="mt-5">
              <Link href="/add-book">Add the first book</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
