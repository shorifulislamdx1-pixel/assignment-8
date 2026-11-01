"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import BookCover from "@/components/BookCover";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { cn, daysFromToday, formatDate } from "@/lib/utils";
import { useProtectedSession } from "@/hooks/use-protected-session";
import type { Borrow } from "@/types";

function dueCopy(dueDate: string) {
  const days = daysFromToday(dueDate);
  if (days < 0) {
    return {
      label: `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue`,
      tone: "danger" as const,
      days,
    };
  }
  if (days === 0) {
    return { label: "Due today", tone: "gold" as const, days };
  }
  if (days === 1) {
    return { label: "Due tomorrow", tone: "gold" as const, days };
  }
  if (days <= 7) {
    return { label: `${days} days left`, tone: "gold" as const, days };
  }
  return { label: `${days} days left`, tone: "soft" as const, days };
}

export default function MyBorrowsView() {
  const { session, isPending, isReady } = useProtectedSession();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    let active = true;

    async function loadBorrows() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Borrow[]>("/borrows");
        if (active) setBorrows(data);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your borrows."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBorrows();
    return () => {
      active = false;
    };
  }, [isReady, reloadKey]);

  const stats = useMemo(() => {
    const dueSoon = borrows.filter((borrow) => {
      const days = daysFromToday(borrow.returnDate);
      return days >= 0 && days <= 7;
    }).length;
    const overdue = borrows.filter(
      (borrow) => daysFromToday(borrow.returnDate) < 0
    ).length;
    return { dueSoon, overdue };
  }, [borrows]);

  const sortedBorrows = useMemo(
    () =>
      [...borrows].sort(
        (a, b) =>
          new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime()
      ),
    [borrows]
  );

  const openReturn = (borrow: Borrow) => {
    setSelectedBorrow(borrow);
    setReturnOpen(true);
  };

  const handleReturn = async () => {
    if (!selectedBorrow) return;
    setReturnLoading(true);
    try {
      await apiFetch<{ message: string }>(`/borrows/${selectedBorrow._id}`, {
        method: "DELETE",
      });
      setBorrows((current) =>
        current.filter((borrow) => borrow._id !== selectedBorrow._id)
      );
      toast.success("Book returned. The shelf is open for the next reader.");
      setReturnOpen(false);
      setSelectedBorrow(null);
    } catch (returnError) {
      toast.error(
        returnError instanceof Error
          ? returnError.message
          : "Could not return this book."
      );
    } finally {
      setReturnLoading(false);
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
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            <BookMarked className="size-3.5" />
            Your reading list
          </div>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
            My borrows
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            Every book currently on loan to you, with a gentle reminder of the
            day it is due back.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="w-fit">
          <Link href="/books">
            Find another read
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Currently borrowed",
            value: borrows.length,
            icon: BookMarked,
            tone: "brand",
          },
          {
            label: "Due within a week",
            value: stats.dueSoon,
            icon: CalendarClock,
            tone: "gold",
          },
          {
            label: "Past the return date",
            value: stats.overdue,
            icon: CircleAlert,
            tone: "danger",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                stat.tone === "brand" && "bg-brand-soft text-brand",
                stat.tone === "gold" && "bg-gold-soft text-gold",
                stat.tone === "danger" && "bg-danger-soft text-danger"
              )}
            >
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
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              We could not open your reading list.
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
        ) : sortedBorrows.length === 0 ? (
          <EmptyState
            title="No books on loan right now."
            description="When you borrow a book, it will wait for you here with its return date. Go find something that keeps you up late."
            actionHref="/books"
            actionLabel="Browse the shelves"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedBorrows.map((borrow) => {
              const due = dueCopy(borrow.returnDate);
              return (
                <article
                  key={borrow._id}
                  className={cn(
                    "group flex gap-4 rounded-2xl border bg-surface p-4 shadow-[0_16px_40px_-38px_rgba(23,37,30,.55)] transition-colors sm:gap-5 sm:p-5",
                    due.tone === "danger"
                      ? "border-danger/35 hover:border-danger/50"
                      : "border-line hover:border-brand/35"
                  )}
                >
                  <Link
                    href={`/books/${borrow.bookId}`}
                    className="w-[86px] shrink-0 self-start overflow-hidden rounded-xl border border-line sm:w-[104px]"
                  >
                    <BookCover
                      src={borrow.bookImage}
                      alt={`${borrow.bookTitle} cover`}
                      title={borrow.bookTitle}
                      className="aspect-[2/3]"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={
                          due.tone === "danger"
                            ? "danger"
                            : due.tone === "gold"
                              ? "gold"
                              : "soft"
                        }
                      >
                        {due.tone === "danger" ? (
                          <CircleAlert className="size-3" />
                        ) : (
                          <Clock3 className="size-3" />
                        )}
                        {due.label}
                      </Badge>
                    </div>

                    <Link
                      href={`/books/${borrow.bookId}`}
                      className="mt-2.5 line-clamp-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink transition-colors hover:text-brand sm:text-2xl"
                    >
                      {borrow.bookTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      by {borrow.bookAuthor}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-brand" />
                        Borrowed {formatDate(borrow.borrowDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <RotateCcw className="size-3.5 text-brand" />
                        Due {formatDate(borrow.returnDate)}
                      </span>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openReturn(borrow)}
                      >
                        <RotateCcw />
                        Return book
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/books/${borrow.bookId}`}>
                          View details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-brand-soft/45 p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand">
          <CheckCircle2 className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink">
            Returning is a two-click kindness.
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">
            When you have finished a book, return it from this page. The copy
            goes straight back onto the shelf so the next reader can borrow it.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={returnOpen}
        onOpenChange={(open) => {
          setReturnOpen(open);
          if (!open) setSelectedBorrow(null);
        }}
        title="Return this book?"
        description={
          selectedBorrow
            ? `Confirm that “${selectedBorrow.bookTitle}” is back on the shelf. One copy will become available for another reader.`
            : "This book will be returned to the shelf."
        }
        confirmLabel="Return book"
        loadingLabel="Returning..."
        loading={returnLoading}
        destructive={false}
        onConfirm={handleReturn}
      />
    </div>
  );
}
