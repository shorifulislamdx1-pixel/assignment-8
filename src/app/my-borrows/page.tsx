"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Borrow } from "@/types";
import { apiFetch } from "@/lib/api";
import BookCover from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">My Borrows</h1>
      <p className="mt-1 text-xs text-muted">Books you are currently reading from BookNook.</p>

      {borrows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/50 p-12 text-center text-sm text-muted">
          You have not borrowed any books yet.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4">Book</th>
                <th className="px-6 py-4">Borrowed Date</th>
                <th className="px-6 py-4">Return Deadline</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {borrows.map((b) => (
                <tr key={b._id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      <BookCover src={b.bookImage} alt={b.bookTitle} title={b.bookTitle} className="size-full" />
                    </div>
                    <span className="font-semibold text-ink">{b.bookTitle}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {new Date(b.borrowDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-brand">
                    {new Date(b.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" onClick={() => handleReturn(b._id)}>
                      Return Book
                    </Button>
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