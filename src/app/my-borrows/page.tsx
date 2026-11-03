
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Borrow } from "@/types";
import { apiFetch } from "@/lib/api";
import BookCover from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function MyBorrowsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/my-borrows");
      return;
    }

    async function loadBorrows() {
      try {
        const data = await apiFetch<Borrow[]>("/borrows");
        setBorrows(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch borrows");
      } finally {
        setLoading(false);
      }
    }

    if (session) loadBorrows();
  }, [session, isPending, router]);

  const handleReturn = async (id: string) => {
    try {
      await apiFetch(`/borrows/${id}`, {
        method: "DELETE",
      });

      toast.success("Book returned successfully!");
      setBorrows((prev) => prev.filter((b) => b._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to return book");
    }
  };

  if (loading || isPending) return null;

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getDateStatus = (date: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const returnDate = new Date(date);
    returnDate.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
      (returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (difference < 0) {
      return {
        label: "Overdue",
        description: `${Math.abs(difference)} days overdue`,
        style: "border-red-200 bg-red-50 text-red-600",
        icon: AlertCircle,
      };
    }

    if (difference === 0) {
      return {
        label: "Due Today",
        description: "Return today",
        style: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      };
    }

    return {
      label: "Upcoming",
      description: `${difference} days remaining`,
      style: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand">
              <BookOpen size={14} />
              Your Reading Collection
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              My Borrows
            </h1>

            <p className="mt-2 text-sm text-muted">
              Keep track of your borrowed books and return deadlines.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <BookOpen size={19} />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">
                {borrows.length}
              </p>
              <p className="text-[11px] font-medium text-muted">
                Active Borrows
              </p>
            </div>
          </div>
        </div>

        {borrows.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface p-12 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <BookOpen size={28} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              No borrowed books yet
            </h2>

            <p className="mt-2 text-sm text-muted">
              Your borrowed books will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-semibold text-ink">
                  Borrowing History
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Manage your currently borrowed books.
                </p>
              </div>

              <span className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
                {borrows.length} Books
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-line bg-surface-muted/70 text-[11px] font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-5">Book Details</th>
                    <th className="px-6 py-5">Borrowed Date</th>
                    <th className="px-6 py-5">Return Deadline</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {borrows.map((b) => {
                    const status = getDateStatus(b.returnDate);
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={b._id}
                        className="transition-colors hover:bg-surface-muted/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-[76px] w-[54px] shrink-0 overflow-hidden rounded-xl bg-surface-muted shadow-sm ring-1 ring-line">
                              <BookCover
                                src={b.bookImage}
                                alt={b.bookTitle}
                                title={b.bookTitle}
                                className="size-full"
                              />
                            </div>

                            <div className="max-w-[220px]">
                              <p className="font-semibold leading-5 text-ink">
                                {b.bookTitle}
                              </p>
                              <p className="mt-1 text-[11px] font-medium text-muted">
                                Borrowed Book
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-muted text-muted">
                              <CalendarDays size={17} />
                            </div>
                            <div>
                              <p className="font-semibold text-ink">
                                {formatDate(b.borrowDate)}
                              </p>
                              <p className="mt-1 text-[10px] text-muted">
                                Borrowed on
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="w-fit rounded-2xl border border-line bg-surface p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <CalendarDays size={19} />
                              </div>

                              <div>
                                <p className="text-sm font-bold tracking-tight text-ink">
                                  {formatDate(b.returnDate)}
                                </p>

                                <div
                                  className={`mt-1.5 flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.style}`}
                                >
                                  <StatusIcon size={11} />
                                  {status.label}
                                </div>
                              </div>
                            </div>

                            <p className="mt-2 pl-1 text-[10px] font-medium text-muted">
                              {status.description}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleReturn(b._id)}
                            className="rounded-xl px-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          >
                            Return Book
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
