import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Join BookNook to borrow books from the community, add your own shelf, and track your reading dates.",
};

function RegisterFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid min-h-[680px] overflow-hidden rounded-[1.75rem] border border-line bg-surface lg:grid-cols-[.92fr_1.08fr]">
        <Skeleton className="hidden rounded-none lg:block" />
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-[420px] space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-6 h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
