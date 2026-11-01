"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Keeps member-only screens private and returns the Better Auth session.
 * The redirect includes the current path so sign-in can bring the reader back.
 */
export function useProtectedSession() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  return {
    session,
    isPending,
    isReady: !isPending && Boolean(session),
  };
}
