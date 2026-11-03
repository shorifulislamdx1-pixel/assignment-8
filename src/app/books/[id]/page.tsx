"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Book } from "@/types";
import { apiFetch } from "@/lib/api";
import BookCover from "@/components/BookCover";
import CategoryIcon from "@/components/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  User,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function BookDetailsContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = getLocalDate();

  const maxReturnDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 60);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/books/${id}`);
    }
  }, [session, isPending, router, id]);

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await apiFetch<Book>(`/books/${id}`, {
          auth: false,
        });

        setBook(data);
        document.title = `${data.title} | BookNook`;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load book";

        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    if (session && id) {
      loadBook();
    }
  }, [id, session]);

  if (isPending || !session || loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">
          Book Not Found
        </h2>

        <Button asChild className="mt-4" variant="outline">
          <Link href="/books">Back to Collection</Link>
        </Button>
      </div>
    );
  }

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!returnDate) {
      toast.error("Please pick a return deadline date");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/borrows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: id,
          returnDate,
        }),
      });

      toast.success("Book borrowed successfully!");
      setModalOpen(false);

      setBook((prev) =>
        prev ? { ...prev, totalCopies: prev.totalCopies - 1 } : null
      );

      setReturnDate("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not borrow book";

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formattedReturnDate = returnDate
    ? new Date(`${returnDate}T12:00:00`).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select your return date";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <Link
        href="/books"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to Collection
      </Link>

      <div className="overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-muted">
            <BookCover
              src={book.image}
              alt={book.title}
              title={book.title}
              className="size-full"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 py-0.5 text-xs font-semibold text-brand"
                >
                  <CategoryIcon
                    category={book.category}
                    className="size-3.5"
                  />
                  {book.category}
                </Badge>

                <span className="text-xs text-muted">
                  Added on {new Date(book.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                {book.title}
              </h1>

              <p className="mt-1 text-sm font-medium text-muted">
                by {book.author}
              </p>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-surface-muted p-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    Available Copies
                  </span>

                  <p className="text-xl font-bold text-brand">
                    {book.totalCopies}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    Added By
                  </span>

                  <p className="flex items-center justify-end gap-1 text-xs font-medium text-ink">
                    <User className="size-3 text-muted" />
                    {book.userName || book.userEmail}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Description
                </h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/90">
                  {book.description}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              {book.totalCopies <= 0 ? (
                <Button
                  disabled
                  className="w-full py-6 text-sm font-semibold opacity-60"
                >
                  Currently Out of Stock
                </Button>
              ) : (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-6 text-sm font-semibold"
                >
                  Borrow this Book
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[28px] border border-line bg-surface shadow-2xl">
            <div className="relative overflow-hidden border-b border-line bg-brand/[0.06] px-7 py-6">
              <div className="absolute -right-8 -top-10 size-36 rounded-full bg-brand/10 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20">
                  <BookOpen size={23} />
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    Confirm Borrow
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    One more step to your next read.
                  </p>
                </div>
              </div>

              <div className="relative mt-4 flex items-center gap-2 text-[11px] font-semibold text-brand">
                <Sparkles size={13} />
                Please verify your details and return deadline.
              </div>
            </div>

            <form onSubmit={handleBorrow} className="space-y-5 p-7">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-ink">
                  <User size={14} className="text-brand" />
                  Your Name
                </label>

                <input
                  type="text"
                  readOnly
                  value={session.user.name || ""}
                  className="w-full rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-muted outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-ink">
                  <User size={14} className="text-brand" />
                  Your Email
                </label>

                <input
                  type="email"
                  readOnly
                  value={session.user.email || ""}
                  className="w-full rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-muted outline-none"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="return-date"
                  className="flex items-center gap-2 text-xs font-bold text-ink"
                >
                  <CalendarDays size={15} className="text-brand" />
                  Return Date
                </label>

                <div className="rounded-2xl border border-line bg-surface p-4 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <CalendarDays size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        Selected Deadline
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-ink">
                        {formattedReturnDate}
                      </p>
                    </div>
                  </div>

                  <input
                    id="return-date"
                    type="date"
                    required
                    min={today}
                    max={maxReturnDate}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="block min-h-12 w-full cursor-pointer rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm font-semibold text-ink outline-none transition-colors hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
                    <Clock3 size={12} />
                    You can borrow a book for up to 60 days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalOpen(false);
                    setReturnDate("");
                  }}
                  className="h-12 flex-1 rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || !returnDate}
                  className="h-12 flex-1 rounded-xl shadow-lg shadow-brand/15 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0"
                >
                  {submitting ? "Confirming..." : "Confirm Borrow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[75vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        </div>
      }
    >
      <BookDetailsContent paramsPromise={params} />
    </Suspense>
  );
}
