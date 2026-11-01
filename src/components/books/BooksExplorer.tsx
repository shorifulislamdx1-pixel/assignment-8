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
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";

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
    async function loadBooks() {
      try {
        setLoading(true);
        // ২৫টি বই একবারে লোড করবে
        const data = await apiFetch<Book[]>("/books?limit=25", { auth: false });
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
    const c: Record<string, number> = { All: books.length };
    BOOK_CATEGORIES.forEach((cat) => {
      c[cat] = books.filter((b) => b.category === cat).length;
    });
    return c;
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory =
          category === "All" || book.category === category;
        const matchesSearch =
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "title-desc") return b.title.localeCompare(a.title);
        if (sort === "copies-desc") return b.totalCopies - a.totalCopies;
        return 0;
      });
  }, [books, category, search, sort]);

  const updateCategory = (newCat: string) => {
    setCategory(newCat);
    const params = new URLSearchParams(searchParams.toString());
    if (newCat === "All") {
      params.delete("category");
    } else {
      params.set("category", newCat);
    }
    router.replace(`/books?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-4 text-xs text-ink outline-none transition-colors focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <SlidersHorizontal className="size-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-brand"
          >
            <option value="newest">Newest First</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
            <option value="copies-desc">Most Copies Available</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => updateCategory("All")}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            category === "All"
              ? "border-brand bg-brand text-brand-foreground"
              : "border-line bg-surface text-muted hover:border-brand/40 hover:text-ink"
          )}
        >
          <BookOpen className="size-3.5" />
          All Books
          <span className="opacity-60">{counts["All"] || 0}</span>
        </button>

        {BOOK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => updateCategory(cat)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === cat
                ? "border-brand bg-brand text-brand-foreground"
                : "border-line bg-surface text-muted hover:border-brand/40 hover:text-ink"
            )}
          >
            <CategoryIcon category={cat as BookCategory} className="size-3.5" />
            {cat}
            <span className="opacity-60">{counts[cat] || 0}</span>
          </button>
        ))}
      </div>

      {/* 5 Columns (Desktop) & 2 Columns (Mobile) Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-line bg-surface p-3"
            >
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto size-10 text-muted opacity-40" />
          <h3 className="mt-4 font-display text-lg font-bold text-ink">
            No Books Found
          </h3>
          <p className="mt-1 text-xs text-muted">
            Try searching with different keywords or filter categories.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              updateCategory("All");
            }}
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}