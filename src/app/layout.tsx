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
  description: "A community-driven library where readers borrow, return, and share books.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <Toaster position="top-right" />
        
        {/* Navbar-কে Suspense দিয়ে র‍্যাপ করা হয়েছে */}
        <Suspense fallback={<div className="h-16" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}