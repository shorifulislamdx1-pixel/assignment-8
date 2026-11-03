export const BOOK_CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const GOOGLE_AUTH_ENABLED =
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_BORROW_DAYS = 14;