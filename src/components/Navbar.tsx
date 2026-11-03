
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  User,
  LogOut,
  UserCircle,
  Menu,
  X,
  Library,
  Plus,
  Bookmark,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";
import { clearApiToken } from "@/lib/api";

const navigation = [
  { label: "Home", href: "/", icon: BookOpen },
  { label: "All Books", href: "/books", icon: Library },
  { label: "Add Book", href: "/add-book", icon: Plus, protected: true },
  { label: "My Books", href: "/my-books", icon: Bookmark, protected: true },
  { label: "My Borrows", href: "/my-borrows", icon: UserCircle, protected: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const visibleLinks = navigation.filter(
    (item) => !item.protected || session
  );

  const handleLogout = async () => {
    setProfileOpen(false);
    setMenuOpen(false);

    try {
      await signOut();
    } finally {
      clearApiToken();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-header backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/15 transition-transform duration-300 group-hover:rotate-[-5deg]">
            <BookOpen className="size-5" />
          </span>

          <span>
            <span className="block font-display text-xl font-bold tracking-tight text-ink">
              BookNook
            </span>
            <span className="hidden text-[10px] font-medium tracking-[0.16em] text-muted sm:block">
              YOUR COMMUNITY LIBRARY
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {session ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-brand/30 bg-surface-muted transition-all hover:border-brand hover:shadow-md"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-brand text-sm font-bold text-brand-foreground">
                    {session.user?.name ? (
                      session.user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-4" />
                    )}
                  </span>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-2xl shadow-black/10">
                  <div className="border-b border-line px-3 py-3">
                    <p className="truncate text-sm font-bold text-ink">
                      {session.user?.name || "Reader"}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {session.user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
                  >
                    <UserCircle className="size-4 text-brand" />
                    View Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:-translate-y-0.5 hover:bg-brand-strong"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-muted lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 pb-5 pt-3 shadow-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-muted hover:bg-surface-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {item.label}
                </Link>
              );
            })}

            {!session && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:hidden">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold text-ink"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground"
                >
                  Get Started
                </Link>
              </div>
            )}

            {session && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex items-center gap-3 rounded-xl border-t border-line px-4 py-4 text-sm font-semibold text-danger"
              >
                <LogOut className="size-[18px]" />
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
