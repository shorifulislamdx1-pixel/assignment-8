"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookCopy,
  BookOpen,
  CalendarDays,
  Layers3,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import BookCover from "@/components/BookCover";
import CategoryIcon from "@/components/CategoryIcon";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { BOOK_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useProtectedSession } from "@/hooks/use-protected-session";
import type { Book, BookCategory } from "@/types";

export default function MyBooksView() {
  const router = useRouter();
  const { session, isPending, isReady } = useProtectedSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    let active = true;

    async function loadBooks() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Book[]>("/books/mine");
        if (active) setBooks(data);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your shelf."
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
  }, [isReady, reloadKey]);

  const stats = useMemo(() => {
    const copies = books.reduce((total, book) => total + book.totalCopies, 0);
    const categories = new Set(books.map((book) => book.category)).size;
    return { copies, categories };
  }, [books]);

  const openEdit = (book: Book) => {
    setEditingBook({ ...book });
    setEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingBook) return;

    setEditSaving(true);
    try {
      const updated = await apiFetch<Book>(`/books/${editingBook._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingBook.title,
          author: editingBook.author,
          category: editingBook.category,
          image: editingBook.image,
          description: editingBook.description,
          totalCopies: editingBook.totalCopies,
        }),
      });
      setBooks((current) =>
        current.map((book) => (book._id === updated._id ? updated : book))
      );
      setEditOpen(false);
      setEditingBook(null);
      toast.success("Book details updated.");
      router.refresh();
    } catch (editError) {
      toast.error(
        editError instanceof Error
          ? editError.message
          : "Could not update this book."
      );
    } finally {
      setEditSaving(false);
    }
  };

  const openDelete = (book: Book) => {
    setDeletingBook(book);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    setDeleteLoading(true);
    try {
      await apiFetch<{ message: string }>(`/books/${deletingBook._id}`, {
        method: "DELETE",
      });
      setBooks((current) =>
        current.filter((book) => book._id !== deletingBook._id)
      );
      toast.success("Book removed from the shelf.");
      setDeleteOpen(false);
      setDeletingBook(null);
      router.refresh();
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this book."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-80 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            <LayoutGrid className="size-3.5" />
            Your contribution
          </div>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
            My books
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            Keep your listings accurate, update a description, or pass a book
            on to someone new.
          </p>
        </div>
        <Button asChild size="lg" className="w-fit">
          <Link href="/add-book">
            <Plus />
            Add a book
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Books listed",
            value: books.length,
            icon: BookOpen,
          },
          {
            label: "Copies on your shelf",
            value: stats.copies,
            icon: BookCopy,
          },
          {
            label: "Categories",
            value: stats.categories,
            icon: Layers3,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <stat.icon className="size-[18px]" />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold leading-none text-ink">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-muted">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              We could not open your shelf.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{error}</p>
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
          <EmptyState
            title="Your shelf is waiting for its first book."
            description="Add a book from your collection and it will appear here, ready to find its next reader."
            actionHref="/add-book"
            actionLabel="Add your first book"
            icon={<Plus className="size-6" />}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="hidden grid-cols-[minmax(0,2.1fr)_1fr_.65fr_.9fr_auto] items-center gap-4 border-b border-line bg-surface-muted/50 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-muted md:grid">
              <span>Book</span>
              <span>Category</span>
              <span>Copies</span>
              <span>Added</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-line/75">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="grid gap-4 px-4 py-4 transition-colors hover:bg-surface-muted/25 sm:px-5 md:grid-cols-[minmax(0,2.1fr)_1fr_.65fr_.9fr_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Link
                      href={`/books/${book._id}`}
                      className="w-12 shrink-0 overflow-hidden rounded-lg border border-line"
                    >
                      <BookCover
                        src={book.image}
                        alt={`${book.title} cover`}
                        title={book.title}
                        className="aspect-[2/3]"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/books/${book._id}`}
                        className="line-clamp-1 font-display text-lg font-semibold text-ink transition-colors hover:text-brand"
                      >
                        {book.title}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        by {book.author}
                      </p>
                      <div className="mt-1.5 md:hidden">
                        <Badge variant="soft">
                          <CategoryIcon
                            category={book.category}
                            className="size-3"
                          />
                          {book.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <Badge variant="soft">
                      <CategoryIcon
                        category={book.category}
                        className="size-3"
                      />
                      {book.category}
                    </Badge>
                  </div>

                  <div className="hidden md:block">
                    <span
                      className={
                        book.totalCopies > 0
                          ? "text-sm font-semibold text-ink"
                          : "text-sm font-semibold text-danger"
                      }
                    >
                      {book.totalCopies}
                    </span>
                    <span className="ml-1 text-[11px] text-muted">available</span>
                  </div>

                  <div className="hidden items-center gap-1.5 text-xs text-muted md:flex">
                    <CalendarDays className="size-3.5" />
                    {formatDate(book.createdAt, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-line/60 pt-3 md:justify-end md:border-0 md:pt-0">
                    <div className="flex items-center gap-2 md:hidden">
                      <span className="text-[11px] text-muted">
                        {book.totalCopies} available ·{" "}
                        {formatDate(book.createdAt, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={`/books/${book._id}`}
                          aria-label={`View ${book.title}`}
                        >
                          <BookOpen />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(book)}
                      >
                        <Pencil />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(book)}
                        aria-label={`Delete ${book.title}`}
                        className="text-danger hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!editSaving) {
            setEditOpen(open);
            if (!open) setEditingBook(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit book details</DialogTitle>
            <DialogDescription>
              Update the catalog card for this book. Changes appear right away.
            </DialogDescription>
          </DialogHeader>

          {editingBook && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingBook.title}
                  onChange={(event) =>
                    setEditingBook({
                      ...editingBook,
                      title: event.target.value,
                    })
                  }
                  maxLength={140}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={editingBook.author}
                    onChange={(event) =>
                      setEditingBook({
                        ...editingBook,
                        author: event.target.value,
                      })
                    }
                    maxLength={120}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
                    value={editingBook.category}
                    onChange={(event) =>
                      setEditingBook({
                        ...editingBook,
                        category: event.target.value as BookCategory,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15"
                  >
                    {BOOK_CATEGORIES.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingBook.description}
                  onChange={(event) =>
                    setEditingBook({
                      ...editingBook,
                      description: event.target.value,
                    })
                  }
                  maxLength={3000}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-copies">Available copies</Label>
                  <Input
                    id="edit-copies"
                    type="number"
                    min={0}
                    max={100}
                    value={editingBook.totalCopies}
                    onChange={(event) =>
                      setEditingBook({
                        ...editingBook,
                        totalCopies: Math.min(
                          100,
                          Math.max(0, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Cover image URL</Label>
                  <Input
                    id="edit-image"
                    type="url"
                    value={editingBook.image}
                    onChange={(event) =>
                      setEditingBook({
                        ...editingBook,
                        image: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-surface-muted/55 p-3">
                <BookCover
                  src={editingBook.image}
                  alt={`${editingBook.title} cover preview`}
                  title={editingBook.title}
                  className="aspect-[2/3] w-12 shrink-0 rounded-md"
                />
                <p className="text-[11px] leading-5 text-muted">
                  Paste a new image URL to replace the cover. Uploaded covers
                  from BookNook keep working.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editSaving}>
                  {editSaving ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingBook(null);
        }}
        title="Remove this book?"
        description={
          deletingBook
            ? `“${deletingBook.title}” will be taken off the shelf. Books with active borrows cannot be deleted until they are returned.`
            : "This book will be removed from the shelf."
        }
        confirmLabel="Remove book"
        loadingLabel="Removing..."
        loading={deleteLoading}
        onConfirm={handleDelete}
      />

      <div className="sr-only" aria-live="polite">
        {session.user.name ? `${session.user.name}'s shelf` : "Your shelf"}
      </div>
    </div>
  );
}
