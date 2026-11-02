import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to BookNook to borrow books, share your shelf, and manage your reading list.",
};

function LoginFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="relative grid min-h-[620px] overflow-hidden rounded-[2rem] border border-line/70 bg-surface shadow-[0_25px_80px_-25px_rgba(24,59,43,0.16)] lg:grid-cols-[.92fr_1.08fr]">

        {/* Left decorative section */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#183b2b] via-[#24583e] to-[#34744b] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-white/5 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl bg-white/15" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-2.5 w-32 bg-white/10" />
              </div>
            </div>
          </div>

          <div className="relative space-y-5">
            <Skeleton className="h-3 w-28 bg-white/20" />
            <Skeleton className="h-12 w-full max-w-sm bg-white/20" />
            <Skeleton className="h-12 w-4/5 bg-white/20" />
            <Skeleton className="h-4 w-full max-w-xs bg-white/10" />
            <Skeleton className="h-4 w-3/4 max-w-xs bg-white/10" />

            <div className="flex gap-3 pt-5">
              <Skeleton className="h-10 w-24 rounded-full bg-white/15" />
              <Skeleton className="h-10 w-24 rounded-full bg-white/15" />
            </div>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/10 pt-6">
            <Skeleton className="h-9 w-9 rounded-full bg-white/15" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 bg-white/20" />
              <Skeleton className="h-2.5 w-24 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Right login form skeleton */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-white via-white to-[#f0f7f1]/70 p-6 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-green-100/30 blur-3xl" />

          <div className="relative w-full max-w-[420px] space-y-6">

            {/* Heading */}
            <div className="space-y-4">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-11 w-4/5 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>

            {/* Form fields */}
            <div className="space-y-5 pt-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>

              {/* Login button */}
              <Skeleton className="h-12 w-full rounded-xl" />

              {/* Divider */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Social login */}
              <Skeleton className="h-12 w-full rounded-xl" />

              {/* Signup link */}
              <div className="flex justify-center gap-2 pt-3">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-line/60 pt-5 text-center">
              <Skeleton className="mx-auto h-3 w-48 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
