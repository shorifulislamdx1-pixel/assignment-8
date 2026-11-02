
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Library,
  BookMarked,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  totalCopies: number;
}

export default function MyBooksPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // User authentication and book loading
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login?redirect=/my-books");
      return;
    }

    if (session) {
      fetchMyBooks();
    }
  }, [session, sessionLoading, router]);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Book[]>("/books/mine");
      setBooks(data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load your books.");
    } finally {
      setLoading(false);
    }
  };

  // Delete book handler
  const handleDelete = async (id: string, title: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${title}"?`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await apiFetch(`/books/${id}`, { method: "DELETE" });
      toast.success("Book removed successfully.");
      setBooks((prev) => prev.filter((book) => book._id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Could not delete the book.");
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (sessionLoading || (loading && books.length === 0)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface shadow-sm">
          <Loader2 className="size-7 animate-spin text-brand" />
        </div>
        <p className="mt-5 font-medium text-ink">
          Preparing your bookshelf
        </p>
        <p className="mt-1 text-sm text-muted">
          Please wait while we fetch your books...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* Page Header */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-line bg-surface px-6 py-9 shadow-sm sm:px-10 sm:py-12">
          <div className="absolute -right-12 -top-16 size-64 rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 size-52 rounded-full bg-brand/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <Library className="size-3.5" />
                YOUR PERSONAL COLLECTION
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                My Bookshelf
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">
                Manage your collection, update book details, and keep your
                library organized in one place.
              </p>
            </div>

            <Button
              asChild
              className="h-11 shrink-0 gap-2 rounded-xl px-5 shadow-sm"
            >
              <Link href="/add-book">
                <Plus className="size-4" />
                Add New Book
              </Link>
            </Button>
          </div>

          {/* Collection Stats */}
          <div className="relative mt-9 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:max-w-md">
            <div className="rounded-xl bg-surface-muted/60 p-4">
              <div className="flex items-center gap-2 text-muted">
                <BookOpen className="size-4" />
                <span className="text-xs font-medium">Total Books</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-ink">
                {books.length}
              </p>
            </div>

            <div className="rounded-xl bg-surface-muted/60 p-4">
              <div className="flex items-center gap-2 text-muted">
                <BookMarked className="size-4" />
                <span className="text-xs font-medium">Total Copies</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-ink">
                {books.reduce((total, book) => total + book.totalCopies, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              Your Collection
            </h2>
            <p className="mt-1 text-sm text-muted">
              All the books you have added to the library.
            </p>
          </div>

          {books.length > 0 && (
            <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
              {books.length} {books.length === 1 ? "Book" : "Books"}
            </span>
          )}
        </div>

        {/* Empty State */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/60 px-5 py-16 text-center sm:py-20">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-brand/10">
              <BookOpen className="size-9 text-brand" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-ink">
              Your bookshelf is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
              You haven&apos;t added any books yet. Start building your
              collection and share your favorite books with the community.
            </p>

            <Button asChild className="mt-7 h-11 gap-2 rounded-xl px-6">
              <Link href="/add-book">
                <Plus className="size-4" />
                Add Your First Book
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface-muted/60">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-6 py-5">Book Details</th>
                      <th className="px-6 py-5">Category</th>
                      <th className="px-6 py-5">Available Copies</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line/70">
                    {books.map((book) => (
                      <tr
                        key={book._id}
                        className="group transition-colors hover:bg-surface-muted/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/books/${book._id}`}
                              className="relative h-[76px] w-[54px] shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted shadow-sm transition-transform duration-300 group-hover:scale-105"
                            >
                              <Image
                                src={book.image}
                                alt={book.title}
                                fill
                                sizes="54px"
                                className="object-cover"
                              />
                            </Link>

                            <div className="min-w-0">
                              <Link
                                href={`/books/${book._id}`}
                                className="line-clamp-2 font-semibold text-ink transition-colors hover:text-brand"
                              >
                                {book.title}
                              </Link>
                              <p className="mt-1 text-xs text-muted">
                                by {book.author}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-line bg-surface-muted/70 px-3 py-1.5 text-xs font-medium text-ink">
                            {book.category}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-brand/10 px-3 py-2 font-bold tabular-nums text-brand">
                            {book.totalCopies}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-9 gap-1.5 rounded-lg border-line px-3 text-xs"
                            >
                              <Link href={`/books/${book._id}/edit`}>
                                <Pencil className="size-3.5" />
                                Edit
                              </Link>
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-9 gap-1.5 rounded-lg px-3 text-xs"
                              disabled={deletingId === book._id}
                              onClick={() =>
                                handleDelete(book._id, book.title)
                              }
                            >
                              {deletingId === book._id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Book Cards */}
            <div className="grid gap-4 md:hidden">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-sm transition-all duration-300 hover:border-brand/30"
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/books/${book._id}`}
                      className="relative h-28 w-[76px] shrink-0 overflow-hidden rounded-xl border border-line bg-surface-muted shadow-sm"
                    >
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        sizes="76px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 py-1">
                      <Link
                        href={`/books/${book._id}`}
                        className="line-clamp-2 font-bold leading-5 text-ink hover:text-brand"
                      >
                        {book.title}
                      </Link>

                      <p className="mt-1.5 line-clamp-1 text-xs text-muted">
                        by {book.author}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-line bg-surface-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted">
                          {book.category}
                        </span>

                        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
                          {book.totalCopies} Copies
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-line pt-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 flex-1 gap-2 rounded-lg border-line"
                    >
                      <Link href={`/books/${book._id}/edit`}>
                        <Pencil className="size-3.5" />
                        Edit Book
                      </Link>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9 flex-1 gap-2 rounded-lg"
                      disabled={deletingId === book._id}
                      onClick={() => handleDelete(book._id, book.title)}
                    >
                      {deletingId === book._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
