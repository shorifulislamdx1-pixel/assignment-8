"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book } from "@/types";
import BookCover from "./BookCover";
import CategoryIcon from "./CategoryIcon";
import { Badge } from "./ui/badge";
import { useSession } from "@/lib/auth-client";

export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      // User login na thakle login page-e redirect korbe
      router.push(`/login?redirect=/books/${book._id}`);
    } else {
      // Login thakle details page-e jabe
      router.push(`/books/${book._id}`);
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
      <div>
        <div className="aspect-[3/4] w-full overflow-hidden bg-surface-muted">
          <BookCover
            src={book.image}
            alt={book.title}
            title={book.title}
            className="size-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 py-0.5 text-[11px] font-semibold text-brand"
            >
              <CategoryIcon category={book.category} className="size-3" />
              {book.category}
            </Badge>
            <span className="text-[11px] font-medium text-muted">
              {book.totalCopies > 0
                ? `${book.totalCopies} copies`
                : "Out of stock"}
            </span>
          </div>

          <h3
            className="mt-3 line-clamp-1 font-display text-lg font-bold text-ink"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted">by {book.author}</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handleDetailsClick}
          className="flex w-full items-center justify-center rounded-xl border border-brand/30 bg-brand-soft py-2.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
        >
          View Details
        </button>
      </div>
    </div>
  );
}