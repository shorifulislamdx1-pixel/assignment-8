"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Edit2, Loader2, Trash2 } from "lucide-react";
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

  // ১. ইউজার অথেন্টিকেশন ও বই লোড করা
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
      // ব্যাকএন্ডের GET /books/mine কল করা
      const data = await apiFetch<Book[]>("/books/mine");
      setBooks(data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load your books.");
    } finally {
      setLoading(false);
    }
  };

  // ২. বই ডিলিট করার হ্যান্ডলার
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

  if (sessionLoading || (loading && books.length === 0)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-brand" />
        <p className="text-sm text-muted">Loading your bookshelf...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Title & Subtitle */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          My Books
        </h1>
        <p className="mt-2 text-sm text-muted">
          Books you added to the library.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/50 p-12 text-center">
          <BookOpen className="size-12 text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-ink">
            No books added yet
          </h2>
          <p className="mt-1 text-sm text-muted">
            Share books with the community by adding them to the collection.
          </p>
          <Button asChild className="mt-6">
            <Link href="/add-book">Add a Book</Link>
          </Button>
        </div>
      ) : (
        /* Books Table */
        <div className="overflow-x-auto rounded-xl border border-line bg-surface/30">
          <table className="w-full text-left text-sm text-muted">
            <thead className="border-b border-line bg-surface-muted/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Book
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Copies
                </th>
                <th scope="col" className="px-6 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {books.map((book) => (
                <tr
                  key={book._id}
                  className="transition-colors hover:bg-surface-muted/30"
                >
                  {/* Book Image + Title + Author */}
                  <td className="flex items-center gap-4 px-6 py-4">
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-surface-muted border border-line/40">
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-ink hover:underline">
                        <Link href={`/books/${book._id}`}>{book.title}</Link>
                      </p>
                      <p className="text-xs text-muted mt-0.5">{book.author}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-ink font-medium">
                    {book.category}
                  </td>

                  {/* Copies */}
                  <td className="px-6 py-4 text-ink font-medium">
                    {book.totalCopies}
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit Button */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 border-line/80 px-3 text-xs text-ink hover:bg-surface-muted"
                      >
                        <Link href={`/books/${book._id}/edit`}>
                          Edit
                        </Link>
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/50 hover:text-red-300 px-3 text-xs"
                        disabled={deletingId === book._id}
                        onClick={() => handleDelete(book._id, book.title)}
                      >
                        {deletingId === book._id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}