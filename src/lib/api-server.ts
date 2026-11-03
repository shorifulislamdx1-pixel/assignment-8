// Server-side helpers for the native Next.js API route handlers.
// This is a faithful port of the Express backend in `server/` (db.ts,
// middleware.ts, types.ts, routes/books.ts, routes/borrows.ts) because
// tsconfig excludes `server/`, so the app cannot import from it directly.
import { MongoClient, ObjectId, type Db } from "mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types (ported from server/types.ts)
// ---------------------------------------------------------------------------

export const BOOK_CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface BookDocument {
  _id?: ObjectId;
  title: string;
  author: string;
  category: BookCategory;
  image: string;
  description: string;
  totalCopies: number;
  userId: string;
  userEmail: string;
  userName: string;
  seedKey?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BorrowDocument {
  _id?: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
  userId: string;
  userEmail: string;
  userName: string;
  borrowDate: Date;
  returnDate: Date;
  status: "active";
}

// ---------------------------------------------------------------------------
// Database (ported from server/db.ts, cached on globalThis so dev HMR and
// warm serverless invocations reuse one connection)
// ---------------------------------------------------------------------------

const globalForMongo = globalThis as typeof globalThis & {
  bookNookApiMongoClient?: MongoClient;
  bookNookApiDb?: Db;
  bookNookApiDbPromise?: Promise<Db>;
};

export async function getDb(): Promise<Db> {
  if (globalForMongo.bookNookApiDb) return globalForMongo.bookNookApiDb;
  if (globalForMongo.bookNookApiDbPromise) {
    return globalForMongo.bookNookApiDbPromise;
  }

  globalForMongo.bookNookApiDbPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured.");
      }
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || "booknook");
      globalForMongo.bookNookApiMongoClient = client;
      globalForMongo.bookNookApiDb = db;
      return db;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  })();

  try {
    return await globalForMongo.bookNookApiDbPromise;
  } catch (error) {
    globalForMongo.bookNookApiDbPromise = undefined;
    globalForMongo.bookNookApiMongoClient = undefined;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Errors (ported from server/middleware.ts so responses match the Express API)
// ---------------------------------------------------------------------------

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error(">>> REAL BACKEND ERROR:", error);

  if (error instanceof HttpError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { message: "The request body is not valid JSON." },
      { status: 400 }
    );
  }

  // The original API returned the error message and stack so the root cause
  // is visible in the client console (api.ts only logs `stack` in dev).
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  const stack = error instanceof Error ? error.stack : undefined;

  return NextResponse.json({ message: errorMessage, stack }, { status: 500 });
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

// Mirrors express.json(): an empty body parses to {}, invalid JSON is a 400.
export async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "The request body is not valid JSON.");
  }
}

// Ported from server/middleware.ts requireAuth.
export async function requireApiUser(request: Request): Promise<ApiUser> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication required.");
  }

  const token = authorization.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new HttpError(500, "Server misconfiguration: JWT_SECRET missing.");
  }

  let payload: AuthTokenPayload;

  try {
    payload = jwt.verify(token, secret, {
      issuer: process.env.JWT_ISSUER || "booknook-web",
      audience: process.env.JWT_AUDIENCE || "booknook-api",
    }) as AuthTokenPayload;
  } catch {
    throw new HttpError(
      401,
      "Your session has expired. Please sign in again."
    );
  }

  if (!payload.sub || !payload.email) {
    throw new HttpError(401, "Invalid authentication token.");
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    image: payload.image ?? null,
  } satisfies ApiUser;
}

// ---------------------------------------------------------------------------
// Validation schemas (ported from server/routes/books.ts and borrows.ts)
// ---------------------------------------------------------------------------

const imageSchema = z
  .string()
  .trim()
  .min(1, "A book cover is required.")
  .refine(
    (value) =>
      /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Enter a valid image URL."
  );

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(140),
  author: z.string().trim().min(1, "Author is required.").max(120),
  category: z.enum(BOOK_CATEGORIES),
  image: imageSchema,
  description: z
    .string()
    .trim()
    .min(10, "Description should be at least 10 characters.")
    .max(3000),
  totalCopies: z
    .number()
    .int("Copies must be a whole number.")
    .min(1, "Add at least one copy.")
    .max(100, "A single listing can have up to 100 copies."),
});

export const updateBookSchema = createBookSchema
  .partial()
  .extend({ totalCopies: z.number().int().min(0).max(100).optional() })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Add at least one field to update.",
  });

export const createBorrowSchema = z.object({
  bookId: z.string().trim().min(1, "A book is required."),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid return date."),
});

// ---------------------------------------------------------------------------
// Mappers and shared helpers (ported from server/routes/*)
// ---------------------------------------------------------------------------

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const safeToISO = (dateVal: unknown): string => {
  if (!dateVal) return new Date().toISOString();
  if (dateVal instanceof Date) return dateVal.toISOString();
  if (typeof dateVal === "string") {
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? dateVal : parsed.toISOString();
  }
  return new Date().toISOString();
};

export const toBookResponse = (book: Record<string, any>) => ({
  ...book,
  _id: book._id?.toString(),
  userId: book.userId || "booknook-curator",
  userEmail: book.userEmail || "curator@booknook.app",
  userName: book.userName || "BookNook Curator",
  totalCopies: typeof book.totalCopies === "number" ? book.totalCopies : 1,
  createdAt: safeToISO(book.createdAt),
  updatedAt: safeToISO(book.updatedAt || book.createdAt),
});

export const toBorrowResponse = (borrow: BorrowDocument) => ({
  ...borrow,
  _id: borrow._id?.toString(),
  bookId: borrow.bookId.toString(),
  borrowDate: borrow.borrowDate.toISOString(),
  returnDate: borrow.returnDate.toISOString(),
});

export const parseBookId = (id: string) => {
  if (!ObjectId.isValid(id)) {
    throw new HttpError(404, "Book not found.");
  }
  return new ObjectId(id);
};

export const canManageBook = (
  book: BookDocument,
  userId: string,
  email: string
) => book.userId === userId || book.userEmail === email;
