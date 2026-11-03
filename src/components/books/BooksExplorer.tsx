
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book, BookCategory } from "@/types";
import { apiFetch } from "@/lib/api";
import { BOOK_CATEGORIES } from "@/lib/constants";
import BookCard from "@/components/BookCard";
import CategoryIcon from "@/components/CategoryIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  X,
  LibraryBig,
  ArrowUpDown,
} from "lucide-react";

type SortOption = "newest" | "title-asc" | "title-desc" | "copies-desc";

export default function BooksExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("q") || "";
  const sortParam = (searchParams.get("sort") as SortOption) || "newest";

  const [search, setSearch] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState<SortOption>(sortParam);

  useEffect(() => {
    setCategory(categoryParam);
    setSearch(searchParam);
    setSort(sortParam);
  }, [categoryParam, searchParam, sortParam]);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const data = await apiFetch<Book[]>("/books?limit=25", {
          auth: false,
        });
        setBooks(data);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      All: books.length,
    };

    BOOK_CATEGORIES.forEach((cat) => {
      result[cat] = books.filter((book) => book.category === cat).length;
    });

    return result;
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory =
          category === "All" || book.category === category;

        const matchesSearch =
          book.title.toLowerCase().includes(search.trim().toLowerCase()) ||
          book.author.toLowerCase().includes(search.trim().toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        if (sort === "title-asc") {
          return a.title.localeCompare(b.title);
        }

        if (sort === "title-desc") {
          return b.title.localeCompare(a.title);
        }

        if (sort === "copies-desc") {
          return b.totalCopies - a.totalCopies;
        }

        return 0;
      });
  }, [books, category, search, sort]);

  const updateCategory = (newCategory: string) => {
    setCategory(newCategory);

    const params = new URLSearchParams(searchParams.toString());

    if (newCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }

    const query = params.toString();
    router.replace(query ? `/books?${query}` : "/books", {
      scroll: false,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    router.replace("/books", { scroll: false });
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-soft/70 via-surface to-surface">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
            <LibraryBig className="size-4" />
            BookNook Collection
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Find Your Next
            <span className="text-brand"> Great Read.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Explore our community collection, discover new authors, and find
            stories worth sharing.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface/80 px-4 py-2 text-xs font-semibold text-muted shadow-sm">
            <BookOpen className="size-4 text-brand" />
            {loading ? "Discovering books..." : `${books.length} books in our collection`}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />

              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border border-line bg-canvas pl-11 pr-11 text-sm text-ink outline-none transition-all placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <ArrowUpDown className="size-4" />
                Sort by
              </div>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="h-12 min-w-0 rounded-xl border border-line bg-canvas px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-brand sm:min-w-48"
              >
                <option value="newest">Newest First</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
                <option value="copies-desc">Most Copies Available</option>
              </select>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-ink">
              <SlidersHorizontal className="size-4 text-brand" />
              Browse Categories
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => updateCategory("All")}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all",
                  category === "All"
                    ? "border-brand bg-brand text-brand-foreground shadow-md shadow-brand/15"
                    : "border-line bg-canvas text-muted hover:border-brand/40 hover:text-ink"
                )}
              >
                <BookOpen className="size-4" />
                All Books
                <span className="opacity-70">{counts.All || 0}</span>
              </button>

              {BOOK_CATEGORIES.map((cat) => {
                const active = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateCategory(cat)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all",
                      active
                        ? "border-brand bg-brand text-brand-foreground shadow-md shadow-brand/15"
                        : "border-line bg-canvas text-muted hover:border-brand/40 hover:text-ink"
                    )}
                  >
                    <CategoryIcon
                      category={cat as BookCategory}
                      className="size-4"
                    />
                    {cat}
                    <span className="opacity-70">{counts[cat] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-6 mt-9 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
              Your reading destination
            </p>

            <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
              {category === "All" ? "Explore Books" : category}
            </h2>

            <p className="mt-1 text-xs text-muted sm:text-sm">
              {loading
                ? "Loading collection..."
                : `${filteredBooks.length} books found`}
            </p>
          </div>

          {(search || category !== "All" || sort !== "newest") && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger-soft"
            >
              <X className="size-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-line bg-surface p-3 sm:rounded-3xl"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="mt-4 h-9 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface px-5 py-16 text-center sm:py-20">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <BookOpen className="size-8" />
            </div>

            <h3 className="mt-5 font-display text-xl font-bold text-ink">
              No Books Found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              We couldn't find any books matching your search. Try another
              title or choose a different category.
            </p>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-6 h-11 rounded-xl border-brand/30 px-6 text-sm font-semibold text-brand hover:bg-brand-soft"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
