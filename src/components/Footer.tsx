
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Heart,
  LibraryBig,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const exploreLinks = [
  { label: "All Books", href: "/books" },
  { label: "Share a Book", href: "/add-book" },
  { label: "My Borrows", href: "/my-borrows" },
  { label: "My Books", href: "/my-books" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/15">
                <BookOpen className="size-5" />
              </span>

              <span>
                <span className="block font-display text-xl font-bold text-ink">
                  BookNook
                </span>
                <span className="text-[10px] font-medium tracking-[0.15em] text-muted">
                  YOUR COMMUNITY LIBRARY
                </span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-muted">
              A community-driven library where every book has a story and every
              reader finds a place to belong.
            </p>

            <p className="flex items-center gap-2 text-xs text-muted">
              Made with
              <Heart className="size-3.5 fill-red-500 text-red-500" />
              for book lovers.
            </p>
          </div>

          <div>
            <h3 className="mb-5 flex items-center gap-2 font-display text-base font-bold text-ink">
              <LibraryBig className="size-4 text-brand" />
              Explore
            </h3>

            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-base font-bold text-ink">
              Get in Touch
            </h3>

            <ul className="space-y-4 text-sm text-muted">
              <li className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Mail className="size-4" />
                </span>
                hello@booknook.app
              </li>

              <li className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Phone className="size-4" />
                </span>
                +880 1700 000 000
              </li>

              <li className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <MapPin className="size-4" />
                </span>
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-base font-bold text-ink">
              A World of Stories
            </h3>

            <p className="text-sm leading-7 text-muted">
              Discover your next favorite book, share what you love, and help
              your reading community grow.
            </p>

            <Link
              href="/books"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:-translate-y-0.5 hover:bg-brand-strong"
            >
              Explore Library
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted">
            © 2026 BookNook. All rights reserved.
          </p>

          <p className="text-xs text-muted">
            Built for readers, powered by community.
          </p>
        </div>
      </div>
    </footer>
  );
}
