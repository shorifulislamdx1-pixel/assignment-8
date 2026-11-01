import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Heart,
  LibraryBig,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line/80 bg-surface/80 text-muted">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-xl font-bold text-ink"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
                <BookOpen className="size-5" />
              </span>
              <span>BookNook</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted">
              A quiet, community-driven online library. Share the stories from
              your personal shelf and discover your next great read.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              Made with <Heart className="size-3.5 fill-red-500 text-red-500" />{" "}
              for book lovers everywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-ink">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/books"
                  className="transition-colors hover:text-brand"
                >
                  All Books Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/add-book"
                  className="transition-colors hover:text-brand"
                >
                  Share a Book
                </Link>
              </li>
              <li>
                <Link
                  href="/my-borrows"
                  className="transition-colors hover:text-brand"
                >
                  Borrowed Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/my-books"
                  className="transition-colors hover:text-brand"
                >
                  My Shelf Contributions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-ink">
              Contact & Visit
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-brand" />
                <span>hello@booknook.app</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-brand" />
                <span>+880 1700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-brand" />
                <span>12 Reading Lane, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-ink">
              Follow Our Shelf
            </h4>
            <p className="text-xs text-muted">
              Follow community additions on modern channels:
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <svg
                  className="size-3.5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <svg className="size-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.791 1.077-2.791 2.744v1.232h4.551l-.71 3.667h-3.841v7.98c7.228-1.139 12.724-7.377 12.724-14.89 0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15 0 7.513 5.496 13.751 12.724 14.89z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/80 pt-6 text-xs text-muted sm:flex-row">
          <p>© 2026 BookNook. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="transition-colors hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/" className="transition-colors hover:text-ink">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}