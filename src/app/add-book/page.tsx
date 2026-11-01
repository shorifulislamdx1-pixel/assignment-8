"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { BOOK_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<string>(BOOK_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/add-book");
    }
  }, [session, isPending, router]);

  const uploadCover = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (key) {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) return data.data.url;
    }
    // Fallback: local public asset if key is missing
    return "/covers/the-great-gatsby.jpg";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload a book cover image");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = await uploadCover(imageFile);

     await apiFetch("/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          category,
          image: imageUrl,
          description,
          totalCopies: Number(totalCopies),
        }),
      });
      
      toast.success("Book added to the library!");
      router.push("/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="rounded-3xl border border-line bg-surface p-8 sm:p-10 shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-ink">Add a New Book</h1>
        <p className="mt-1 text-xs text-muted">Contribute a book from your shelf to the community.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Book Title</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sapiens"
              className="bg-surface"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Author</label>
              <Input
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Yuval Noah Harari"
                className="bg-surface"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink outline-none focus:border-brand"
              >
                {BOOK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Cover Image</label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand hover:file:bg-brand-soft-strong cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Total Copies</label>
              <Input
                type="number"
                min={1}
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give a short overview of the book..."
              className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink outline-none focus:border-brand"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full py-6 text-sm font-semibold">
            {submitting ? "Uploading & Saving..." : "Publish Book"}
          </Button>
        </form>
      </div>
    </div>
  );
}