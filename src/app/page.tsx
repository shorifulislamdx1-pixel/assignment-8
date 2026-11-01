"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import BookCard from "@/components/BookCard";
import CategoryIcon from "@/components/CategoryIcon";
import { Book, BookCategory } from "@/types";
import { apiFetch } from "@/lib/api";
import { BOOK_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function HomeContent() {
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        // Home page-e latest 5 ba 10-ti book dekhabe
        const data = await apiFetch<Book[]>("/books?sort=newest&limit=10", {
          auth: false,
        });
        setNewArrivals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  const bannerSlides = [
    {
      title: "Your neighbourhood library, online",
      subtitle:
        "Discover, borrow, and read stories from timeless classics to modern bestsellers.",
      bg: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Share your shelves with fellow readers",
      subtitle:
        "Catalog books from your personal room and lend them to community members.",
      bg: "https://images.unsplash.com/photo-1507842229451-7f01be7a70d3?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Read seamlessly in three quiet steps",
      subtitle:
        "Select a book, confirm your borrow date, and return when you're finished.",
      bg: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Swiper Section */}
      <section className="relative h-[480px] w-full overflow-hidden sm:h-[540px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="hero-swiper h-full w-full"
        >
          {bannerSlides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="relative flex h-full w-full items-center justify-center bg-cover bg-center px-6"
                style={{ backgroundImage: `url(${slide.bg})` }}
              >
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
                <div className="relative z-10 max-w-3xl text-center text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                    BookNook Shelf
                  </span>
                  <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mx-auto mt-4 max-w-xl text-sm text-gray-300 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <Button asChild className="rounded-xl px-6 py-5 text-sm font-semibold">
                      <Link href="/books">Explore All Books</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. New Arrivals (5/2 Columns Grid) */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              Fresh additions
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
              New Arrivals
            </h2>
          </div>
          <Link href="/books" className="text-xs font-semibold text-brand hover:underline">
            View full shelf →
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-line bg-surface p-3"
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {newArrivals.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {/* See All Books Button */}
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="rounded-xl px-8 py-5 text-sm font-semibold shadow-md">
            <Link href="/books">See All Books</Link>
          </Button>
        </div>
      </section>

      {/* 3. How Borrowing Works */}
      <section className="border-y border-line bg-surface/40 py-16">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            Simple & Transparent
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            How Borrowing Works
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            No library cards, no complex paperwork. Just sharing stories.
          </p>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <span className="inline-block rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                01
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Find a Book</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Explore the public catalog, filter by your favorite genre, or search by title and author.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <span className="inline-block rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                02
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Borrow It</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Select an available copy, set your estimated return date, and borrow with one click.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <span className="inline-block rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                03
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Return with Ease</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Finished reading? Mark it returned right from your My Borrows dashboard instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Categories */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            Curated shelves
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Browse by Genre
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {BOOK_CATEGORIES.map((cat: string) => (
            <Link
              key={cat}
              href={`/books?category=${cat}`}
              className="group flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:border-brand/50 hover:bg-surface-muted"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <CategoryIcon category={cat as BookCategory} className="size-6" />
              </div>
              <h4 className="mt-4 font-display text-sm font-semibold text-ink">{cat}</h4>
              <span className="mt-1 text-[11px] text-muted">Explore shelf →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}