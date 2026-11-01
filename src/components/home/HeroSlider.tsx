"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Sparkles } from "lucide-react";
import { Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BookCover from "@/components/BookCover";

const slides = [
  {
    eyebrow: "A community library, open to all",
    title: "A quiet corner for",
    emphasis: "every reader.",
    description:
      "Wander through a hand-picked shelf of fiction, ideas, histories, and stories for younger readers. Find something worth staying up late for.",
    primary: { label: "Explore the shelves", href: "/books" },
    secondary: { label: "Join BookNook", href: "/register" },
    featured: {
      src: "/covers/the-midnight-library.jpg",
      alt: "The Midnight Library cover",
      title: "The Midnight Library",
    },
    left: { src: "/covers/the-great-gatsby.jpg", alt: "The Great Gatsby cover" },
    right: { src: "/covers/sapiens.jpg", alt: "Sapiens cover" },
    note: "Fresh arrivals every week",
  },
  {
    eyebrow: "Your shelf, shared with others",
    title: "The best stories are",
    emphasis: "better shared.",
    description:
      "Add a few favourites from your own collection. Someone nearby might be looking for exactly the book you have been meaning to pass along.",
    primary: { label: "Add a book", href: "/add-book" },
    secondary: { label: "Browse the collection", href: "/books" },
    featured: {
      src: "/covers/atomic-habits.jpg",
      alt: "Atomic Habits cover",
      title: "Atomic Habits",
    },
    left: { src: "/covers/the-hobbit.jpg", alt: "The Hobbit cover" },
    right: { src: "/covers/dune.jpg", alt: "Dune cover" },
    note: "One click to share a copy",
  },
  {
    eyebrow: "Borrow gently, return kindly",
    title: "Borrow. Read.",
    emphasis: "Return. Repeat.",
    description:
      "Borrowing should feel effortless. Choose a return date, keep track of your reads, and return the book when the last page is turned.",
    primary: { label: "Find your next read", href: "/books" },
    secondary: { label: "How it works", href: "#how-it-works" },
    featured: {
      src: "/covers/the-hobbit.jpg",
      alt: "The Hobbit cover",
      title: "The Hobbit",
    },
    left: { src: "/covers/educated.jpg", alt: "Educated cover" },
    right: { src: "/covers/pride-and-prejudice.jpg", alt: "Pride and Prejudice cover" },
    note: "No late fees, just good books",
  },
];

export default function HeroSlider() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#061a12] text-[#f4f0e6]">
      <div className="pointer-events-none absolute -left-28 top-10 size-[420px] rounded-full bg-[#1a7057]/35 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 top-0 size-[360px] rounded-full bg-[#b28a4c]/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(99,216,170,.09),transparent_38%)]" />

      <Swiper
        modules={[Autoplay, Pagination, Navigation, Keyboard]}
        slidesPerView={1}
        spaceBetween={0}
        speed={800}
        loop
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        keyboard={{ enabled: true }}
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-5 pb-24 pt-14 sm:px-6 md:grid-cols-[1.08fr_.92fr] md:gap-6 lg:min-h-[680px] lg:px-8 lg:pt-16">
              <div className="relative z-10 max-w-2xl animate-rise">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b7e3d2] backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-[#9ee7cb]" />
                  {slide.eyebrow}
                </div>

                <h1 className="mt-6 text-balance font-display text-[2.85rem] font-semibold leading-[1.03] tracking-[-0.045em] text-[#f6f1e6] sm:text-6xl lg:text-[4.7rem]">
                  {slide.title}{" "}
                  <span className="italic text-[#a2e3c8]">
                    {slide.emphasis}
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#b7c7bd] sm:text-[15px]">
                  {slide.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.primary.href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#9fe7c9] px-6 text-sm font-bold text-[#062016] shadow-[0_18px_40px_-20px_rgba(159,231,201,.8)] transition-all hover:-translate-y-0.5 hover:bg-[#b9f0d9]"
                  >
                    {slide.primary.label}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href={slide.secondary.href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 text-sm font-semibold text-[#eef5ef] backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/[0.08]"
                  >
                    {slide.secondary.label}
                  </Link>
                </div>

                <div className="mt-8 flex items-center gap-3 text-[11px] text-[#8fa79b]">
                  <span className="flex -space-x-2">
                    {[slide.left, slide.right].map((cover) => (
                      <span
                        key={cover.alt}
                        className="size-7 overflow-hidden rounded-full border-2 border-[#061a12]"
                      >
                        <img
                          src={cover.src}
                          alt=""
                          className="size-full object-cover"
                        />
                      </span>
                    ))}
                    <span className="grid size-7 place-items-center rounded-full border-2 border-[#061a12] bg-[#12392b] text-[9px] font-bold text-[#a9e4cc]">
                      +
                    </span>
                  </span>
                  <span>Borrowed by readers in your community</span>
                </div>
              </div>

              <div className="relative mx-auto mt-2 flex h-[330px] w-full max-w-[430px] items-center justify-center sm:h-[410px] md:mt-0 md:h-[480px]">
                <div className="absolute inset-8 rounded-full bg-[#2b8c6d]/20 blur-3xl" />
                <div className="absolute left-[8%] top-[18%] w-[33%] -rotate-[13deg] overflow-hidden rounded-xl border border-white/10 shadow-[0_28px_60px_-18px_rgba(0,0,0,.75)]">
                  <BookCover
                    src={slide.left.src}
                    alt={slide.left.alt}
                    title={slide.left.alt}
                    className="aspect-[2/3]"
                  />
                </div>
                <div className="absolute right-[7%] top-[13%] w-[31%] rotate-[10deg] overflow-hidden rounded-xl border border-white/10 shadow-[0_28px_60px_-18px_rgba(0,0,0,.75)]">
                  <BookCover
                    src={slide.right.src}
                    alt={slide.right.alt}
                    title={slide.right.alt}
                    className="aspect-[2/3]"
                  />
                </div>
                <div className="relative z-10 w-[41%] -rotate-[2deg] overflow-hidden rounded-2xl border border-white/15 shadow-[0_35px_80px_-20px_rgba(0,0,0,.9)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
                  <BookCover
                    src={slide.featured.src}
                    alt={slide.featured.alt}
                    title={slide.featured.title}
                    className="aspect-[2/3]"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
                    <p className="line-clamp-2 font-display text-sm font-semibold text-white">
                      {slide.featured.title}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-[3%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#0b2419]/90 px-3.5 py-2 text-[10px] font-semibold text-[#c9e8da] shadow-xl backdrop-blur-md">
                  <BookOpenText className="size-3.5 text-[#9fe7c9]" />
                  {slide.note}
                </div>

                <div className="absolute left-[3%] top-[5%] size-12 rounded-full border border-dashed border-[#9fe7c9]/30" />
                <div className="absolute bottom-[17%] right-[1%] size-20 rounded-full border border-[#b28a4c]/20" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#061a12]/70 to-transparent" />
    </section>
  );
}
