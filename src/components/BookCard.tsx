
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Book } from "@/types";
import BookCover from "./BookCover";
import CategoryIcon from "./CategoryIcon";
import { useSession } from "@/lib/auth-client";

export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const { data: session } = useSession();

  const available = book.totalCopies > 0;

  const handleDetailsClick = () => {
    if (!session) {
      router.push(`/login?redirect=/books/${book._id}`);
      return;
    }

    router.push(`/books/${book._id}`);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/5 sm:rounded-3xl">
      <div className="relative overflow-hidden bg-surface-muted">
        <div className="aspect-[3/4] w-full">
          <BookCover
            src={book.image}
            alt={book.title}
            title={book.title}
            className="size-full"
            imageClassName="transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-sm backdrop-blur-md sm:text-[10px]">
            <CategoryIcon
              category={book.category}
              className="size-3 shrink-0"
            />
            <span className="truncate">{book.category}</span>
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[9px] font-bold shadow-sm backdrop-blur-md sm:text-[10px] ${
              available
                ? "bg-emerald-500/90 text-white"
                : "bg-black/65 text-white"
            }`}
          >
            {available ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <XCircle className="size-3" />
            )}
            {available ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="min-h-0 flex-1">
          <h3
            className="line-clamp-2 min-h-[2.7rem] font-display text-sm font-bold leading-snug text-ink transition-colors group-hover:text-brand sm:text-base"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="mt-1.5 truncate text-[11px] text-muted sm:text-xs">
            by {book.author}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-muted sm:text-[10px]">
              Copies
            </p>
            <p className="mt-0.5 text-xs font-bold text-ink sm:text-sm">
              {book.totalCopies}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetailsClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-[10px] font-bold text-brand-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-strong hover:shadow-md sm:px-3.5 sm:text-xs"
          >
            <BookOpen className="size-3.5" />
            Details
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
