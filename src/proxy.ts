import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // better-auth ba session cookie ache kina check korbe
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("booknook_api_token");

  // Books details ba protected routes
  const isBookDetails = pathname.startsWith("/books/") && pathname !== "/books";
  const isProtected =
    isBookDetails ||
    pathname.startsWith("/add-book") ||
    pathname.startsWith("/my-books") ||
    pathname.startsWith("/my-borrows");

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/books/:id*",
    "/add-book/:path*",
    "/my-books/:path*",
    "/my-borrows/:path*",
  ],
};
