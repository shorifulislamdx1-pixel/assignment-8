"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import BookCover from "@/components/BookCover";
import CategoryIcon from "@/components/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, uploadBookCover } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { BOOK_CATEGORIES } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import type { Book, BookCategory } from "@/types";

const tips = [
  "Use a clear front cover so readers can spot the book.",
  "A short description works better than a long summary.",
  "Check the copy count so the shelf stays accurate.",
];

export default function AddBookPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<BookCategory>("Fiction");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState(1);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("That image is larger than 5 MB.");
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const imageSource =
      coverMode === "upload"
        ? selectedFile
          ? ""
          : null
        : coverUrl.trim() || null;

    if (imageSource === null) {
      toast.error(
        coverMode === "upload"
          ? "Choose a cover image to upload."
          : "Paste a cover image URL."
      );
      return;
    }

    if (totalCopies < 1) {
      toast.error("Add at least one copy.");
      return;
    }

    setSubmitting(true);
    try {
      const image =
        coverMode === "upload" && selectedFile
          ? await uploadBookCover(selectedFile)
          : coverUrl.trim();

      const created = await apiFetch<Book>("/books", {
        method: "POST",
        body: JSON.stringify({
          title,
          author,
          category,
          description,
          totalCopies,
          image,
        }),
      });

      toast.success("Your book is on the shelf.");
      router.push(`/books/${created._id}`);
      router.refresh();
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Could not add this book."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage =
    coverMode === "upload" ? filePreview : coverUrl.trim();

  if (isPending || !session) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-5 h-12 w-96 max-w-full" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <Skeleton className="h-[620px] rounded-2xl" />
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/my-books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-3.5" />
        Back to my shelf
      </Link>

      <div className="mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            <Plus className="size-3.5" />
            Grow the library
          </div>
          <h1 className="mt-3 text-balance font-display text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
            Add a book to the shelf.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            Tell us enough to help the right reader find it. You can update the
            details at any time from My books.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface/70 px-3.5 py-2.5">
          <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-brand-soft text-[10px] font-bold text-brand">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              getInitials(session.user.name)
            )}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              Adding as
            </p>
            <p className="text-xs font-semibold text-ink">
              {session.user.name}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-9 grid items-start gap-7 lg:grid-cols-[1.22fr_.78fr] lg:gap-10"
      >
        <div className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-[0_20px_50px_-45px_rgba(23,37,30,.6)] sm:p-7 lg:p-8">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              The essentials
            </h2>
            <p className="mt-1 text-xs text-muted">
              A few details for the catalog card.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-title">Book title</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. The Midnight Library"
              maxLength={140}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-author">Author</Label>
              <Input
                id="book-author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="e.g. Matt Haig"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-category">Category</Label>
              <div className="relative">
                <CategoryIcon
                  category={category}
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand"
                />
                <select
                  id="book-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as BookCategory)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-10 pr-9 text-sm font-medium text-ink outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15"
                >
                 {BOOK_CATEGORIES.map((item: string) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                  ▾
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-description">Description</Label>
            <Textarea
              id="book-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this book about? Why would another reader love it?"
              maxLength={3000}
              required
              className="min-h-36"
            />
            <p className="text-right text-[10px] text-muted">
              {description.length}/3000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-copies">Available copies</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setTotalCopies((value) => Math.max(1, value - 1))}
                aria-label="Decrease copies"
              >
                −
              </Button>
              <Input
                id="book-copies"
                type="number"
                min={1}
                max={100}
                value={totalCopies}
                onChange={(event) =>
                  setTotalCopies(
                    Math.min(100, Math.max(1, Number(event.target.value) || 1))
                  )
                }
                className="w-24 text-center"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setTotalCopies((value) => Math.min(100, value + 1))
                }
                aria-label="Increase copies"
              >
                +
              </Button>
              <span className="text-xs text-muted">copies to share</span>
            </div>
          </div>

          <div className="border-t border-line/80 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                  The cover
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Upload an image or paste a link from anywhere.
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-line bg-surface-muted/60 p-1">
                <button
                  type="button"
                  onClick={() => setCoverMode("upload")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    coverMode === "upload"
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  )}
                >
                  <UploadCloud className="size-3.5" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode("url")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    coverMode === "url"
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  )}
                >
                  <Link2 className="size-3.5" />
                  Image URL
                </button>
              </div>
            </div>

            {coverMode === "upload" ? (
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-muted/35 px-5 py-9 text-center transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <ImagePlus className="size-5" />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-ink">
                    {selectedFile ? selectedFile.name : "Choose a cover image"}
                  </span>
                  <span className="mt-1 text-[11px] text-muted">
                    JPG, PNG, WebP, or GIF · up to 5 MB
                  </span>
                  {selectedFile && (
                    <span className="mt-3 text-[11px] font-semibold text-brand">
                      Choose a different file
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <Input
                  type="url"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                  placeholder="https://example.com/book-cover.jpg"
                  required={coverMode === "url"}
                />
                <p className="text-[11px] text-muted">
                  Use a direct image link that ends in .jpg, .png, or .webp for
                  the best result.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line/80 pt-6 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="outline">
              <Link href="/my-books">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Adding to the shelf...
                </>
              ) : (
                <>
                  Add book
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Listing preview
              </h2>
              <Badge variant="soft">
                <Sparkles className="size-3" />
                Live
              </Badge>
            </div>

            <div className="mx-auto mt-5 max-w-[240px]">
              <div className="rounded-xl border border-line bg-canvas p-2 shadow-[0_24px_50px_-30px_rgba(23,37,30,.55)]">
                <BookCover
                  src={previewImage}
                  alt={title || "Book cover preview"}
                  title={title || "Your book cover"}
                  className="aspect-[2/3] rounded-lg"
                />
              </div>
            </div>

            <div className="mt-5 text-center">
              <Badge variant="secondary">
                <CategoryIcon category={category} className="size-3" />
                {category}
              </Badge>
              <h3 className="mt-3 line-clamp-2 font-display text-2xl font-semibold leading-tight tracking-[-0.025em] text-ink">
                {title || "Your book title"}
              </h3>
              <p className="mt-1 text-xs text-muted">
                by {author || "Author name"}
              </p>
              <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted/90">
                {description ||
                  "A short description will appear here so readers can decide if this is the right next read."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-[10px] text-muted">
                <span className="flex items-center gap-1.5">
                  <BookOpenCheck className="size-3.5 text-brand" />
                  {totalCopies} {totalCopies === 1 ? "copy" : "copies"}
                </span>
                <span className="font-semibold text-brand">View details</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-brand-soft/50 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Sparkles className="size-4 text-brand" />
              A good shelf listing
            </h2>
            <ul className="mt-3 space-y-2.5">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-[11px] leading-5 text-muted"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/60 px-3.5 py-3 text-[11px] text-muted">
            <UserRound className="size-4 shrink-0 text-brand" />
            Your name and email stay attached to this listing.
          </div>
        </aside>
      </form>
    </div>
  );
}
