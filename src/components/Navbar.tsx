"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, LogOut, UserCircle } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";
import { clearApiToken } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  // Dropdown baire click korle close kora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/80 bg-header backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
              <BookOpen className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              BookNook
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-brand ${
                isActive("/") ? "font-semibold text-brand" : "text-muted"
              }`}
            >
              Home
            </Link>
            <Link
              href="/books"
              className={`transition-colors hover:text-brand ${
                isActive("/books") ? "font-semibold text-brand" : "text-muted"
              }`}
            >
              All Books
            </Link>

            {/* Login thakle ei menu gulo dekhabe */}
            {session && (
              <>
                <Link
                  href="/add-book"
                  className={`transition-colors hover:text-brand ${
                    isActive("/add-book")
                      ? "font-semibold text-brand"
                      : "text-muted"
                  }`}
                >
                  Add Book
                </Link>
                <Link
                  href="/my-books"
                  className={`transition-colors hover:text-brand ${
                    isActive("/my-books")
                      ? "font-semibold text-brand"
                      : "text-muted"
                  }`}
                >
                  My Books
                </Link>
                <Link
                  href="/my-borrows"
                  className={`transition-colors hover:text-brand ${
                    isActive("/my-borrows")
                      ? "font-semibold text-brand"
                      : "text-muted"
                  }`}
                >
                  My Borrows
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: Theme Toggle & Profile Avatar / Login */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-muted transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand text-xs font-bold text-brand-foreground">
                    {session.user?.name ? (
                      session.user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Profile dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-surface p-2 shadow-xl">
                  <div className="border-b border-line px-3 py-2">
                    <p className="line-clamp-1 text-xs font-bold text-ink">
                      {session.user?.name || "Reader"}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted">
                      {session.user?.email}
                    </p>
                  </div>

                  <div className="pt-1">
                    {/* View Profile Link */}
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-muted ${
                        isActive("/profile") ? "text-brand font-semibold" : "text-ink"
                      }`}
                    >
                      <UserCircle className="size-4 text-muted" />
                      View Profile
                    </Link>

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        try {
                          await signOut();
                        } finally {
                          clearApiToken();
                        }
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}