
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import {
  ArrowRight,
  BookOpen,
  Search,
  Share2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
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
      eyebrow: "Discover your next chapter",
      title: "Your neighbourhood library, online.",
      subtitle:
        "Explore a growing collection of books, discover new perspectives, and find your next favorite read.",
      bg: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=85",
    },
    {
      eyebrow: "A community of readers",
      title: "Share your shelves. Share stories.",
      subtitle:
        "Give your favorite books a new home by sharing them with readers in your community.",
      bg: "https://images.unsplash.com/photo-1507842229451-7f01be7a70d3?auto=format&fit=crop&w=1800&q=85",
    },
    {
      eyebrow: "Reading made simple",
      title: "More stories. Less barriers.",
      subtitle:
        "Find a book, borrow it with ease, and enjoy the simple pleasure of reading.",
      bg: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=85",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Discover a Book",
      description:
        "Explore the collection and find stories that match your interests.",
      icon: Search,
    },
    {
      number: "02",
      title: "Borrow & Enjoy",
      description:
        "Choose an available book and start your next reading adventure.",
      icon: BookOpen,
    },
    {
      number: "03",
      title: "Return & Share",
      description:
        "Return your book and make it available for another reader.",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="overflow-hidden pb-16">
      <section className="relative h-[440px] w-full overflow-hidden sm:h-[500px] lg:h-[590px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          loop
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          className="hero-swiper h-full w-full"
        >
          {bannerSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative flex h-full items-center justify-center bg-cover bg-center px-5 sm:px-10"
                style={{ backgroundImage: `url(${slide.bg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
                <div className="absolute inset-0 bg-black/15" />

                <div className="relative z-10 mx-auto w-full max-w-7xl pb-8 text-center sm:pb-10 lg:text-left">
                  <div className="mx-auto max-w-3xl lg:mx-0">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:text-xs">
                      <Sparkles className="size-3.5 text-brand" />
                      {slide.eyebrow}
                    </span>

                    <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                      {slide.title}
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base lg:mx-0 lg:text-lg">
                      {slide.subtitle}
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                      <Button
                        asChild
                        className="h-12 rounded-xl bg-brand px-6 text-sm font-bold text-brand-foreground shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-brand-strong"
                      >
                        <Link href="/books">
                          Explore Books
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                      >
                        <Link href="/register">Join Community</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">
              Fresh additions
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-2 text-sm text-muted">
              Discover the latest additions to our community shelf.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand transition-all hover:gap-3 sm:text-sm"
          >
            View All Books
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-line bg-surface p-3"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {newArrivals.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface/60 px-5 py-14 text-center">
            <BookOpen className="mx-auto size-9 text-muted" />
            <h3 className="mt-4 font-display text-lg font-bold text-ink">
              No Books Available Yet
            </h3>
            <p className="mt-2 text-sm text-muted">
              New books will appear here when they are added.
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            className="h-12 rounded-xl bg-brand px-7 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/10 hover:bg-brand-strong"
          >
            <Link href="/books">
              Explore Full Collection
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-20 border-y border-line bg-surface/70 py-16 sm:mt-24 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">
              Simple & meaningful
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              How BookNook Works
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A better way to discover, borrow, and share books with your
              community.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group rounded-3xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/5 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold text-brand/20">
                      {step.number}
                    </span>

                    <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <Icon className="size-5" />
                    </span>
                  </div>

                  <h3 className="mt-7 font-display text-xl font-bold text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">
            Find your next favorite
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Browse by Genre
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
            Explore different worlds, ideas, and stories through our curated
            book categories.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {BOOK_CATEGORIES.map((category: string) => (
            <Link
              key={category}
              href={`/books?category=${encodeURIComponent(category)}`}
              className="group flex min-h-36 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-3 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand-soft/40 hover:shadow-lg sm:min-h-40 sm:rounded-3xl"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-all duration-300 group-hover:rotate-[-5deg] group-hover:bg-brand group-hover:text-brand-foreground">
                <CategoryIcon
                  category={category as BookCategory}
                  className="size-6"
                />
              </span>

              <h3 className="mt-4 font-display text-sm font-bold text-ink sm:text-base">
                {category}
              </h3>

              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-muted transition-colors group-hover:text-brand">
                Explore shelf
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-center shadow-xl shadow-brand/10 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border-[40px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full border-[40px] border-white/5" />

          <div className="relative mx-auto max-w-2xl">
            <Share2 className="mx-auto size-8 text-brand-foreground/80" />
            <h2 className="mt-5 font-display text-3xl font-bold text-brand-foreground sm:text-4xl">
              Every Book Deserves a Reader.
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-foreground/80 sm:text-base">
              Share your books with the community and help someone discover
              their next favorite story.
            </p>

            <Button
              asChild
              className="mt-7 h-12 rounded-xl bg-white px-7 text-sm font-bold text-brand shadow-lg hover:bg-white/90"
            >
              <Link href="/add-book">
                Share a Book
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
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
          <div className="size-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
