
import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BookNook — Community Library",
    template: "%s | BookNook",
  },
  description:
    "A community-driven library where readers borrow, return, and share books.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              fontSize: "13px",
            },
          }}
        />

        <Suspense fallback={<div className="h-[72px]" />}>
          <Navbar />
        </Suspense>

        <main className="min-w-0 flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
