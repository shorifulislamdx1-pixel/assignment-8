import { Router } from "express";
import { ObjectId, type Filter, type Sort } from "mongodb";
import { z } from "zod";
import { getDb } from "../db";
import { asyncHandler, HttpError, requireAuth } from "../middleware";
import {
  BOOK_CATEGORIES,
  type BookCategory,
  type BookDocument,
} from "../types";

export const booksRouter = Router();

const imageSchema = z
  .string()
  .trim()
  .min(1, "A book cover is required.")
  .refine(
    (value) =>
      /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Enter a valid image URL."
  );

const createBookSchema = z.object({
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

const updateBookSchema = createBookSchema
  .partial()
  .extend({ totalCopies: z.number().int().min(0).max(100).optional() })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Add at least one field to update.",
  });

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const safeToISO = (dateVal: unknown): string => {
  if (!dateVal) return new Date().toISOString();
  if (dateVal instanceof Date) return dateVal.toISOString();
  if (typeof dateVal === "string") {
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? dateVal : parsed.toISOString();
  }
  return new Date().toISOString();
};

const toBookResponse = (book: Record<string, any>) => ({
  ...book,
  _id: book._id?.toString(),
  userId: book.userId || "booknook-curator",
  userEmail: book.userEmail || "curator@booknook.app",
  userName: book.userName || "BookNook Curator",
  totalCopies: typeof book.totalCopies === "number" ? book.totalCopies : 1,
  createdAt: safeToISO(book.createdAt),
  updatedAt: safeToISO(book.updatedAt || book.createdAt),
});

const parseBookId = (id: string) => {
  if (!ObjectId.isValid(id)) {
    throw new HttpError(404, "Book not found.");
  }
  return new ObjectId(id);
};

const canManageBook = (book: BookDocument, userId: string, email: string) =>
  book.userId === userId || book.userEmail === email;

// ১. GET / (সকল বই লোড করার রাউট)
booksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const books = db.collection<BookDocument>("books");

    const category =
      typeof req.query.category === "string" ? req.query.category : "";
    const search =
      typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
      : 100;

    const filter: Filter<BookDocument> = {};
    if (category && BOOK_CATEGORIES.includes(category as BookCategory)) {
      filter.category = category as BookCategory;
    }
    if (search) {
      const expression = new RegExp(escapeRegExp(search), "i");
      filter.$or = [
        { title: expression },
        { author: expression },
        { description: expression },
      ];
    }

    const sortMap: Record<string, Sort> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
      author: { author: 1 },
    };

    const result = await books
      .find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .limit(limit)
      .toArray();

    res.json(result.map(toBookResponse));
  })
);

// ২. GET /mine (ইউজারের নিজস্ব বই)
booksRouter.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const db = await getDb();
    const books = db.collection<BookDocument>("books");

    const result = await books
      .find({
        $or: [{ userId: user.id }, { userEmail: user.email }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(result.map(toBookResponse));
  })
);

// ৩. GET /:id (নির্দিষ্ট বইয়ের ডিটেইলস)
booksRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const book = await db
      .collection<BookDocument>("books")
      .findOne({ _id: parseBookId(req.params.id) });

    if (!book) throw new HttpError(404, "Book not found.");
    res.json(toBookResponse(book));
  })
);

// ৪. POST / (নতুন বই যুক্ত করা)
booksRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createBookSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Invalid book details."
      );
    }

    const user = req.user!;
    const db = await getDb();
    const now = new Date();
    const book: BookDocument = {
      ...parsed.data,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<BookDocument>("books").insertOne(book);
    res.status(201).json(toBookResponse({ ...book, _id: result.insertedId }));
  })
);

// ৫. PATCH /:id (বই এডিট করা)
booksRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = updateBookSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Invalid book details."
      );
    }

    const user = req.user!;
    const db = await getDb();
    const books = db.collection<BookDocument>("books");
    const bookId = parseBookId(req.params.id);
    const existing = await books.findOne({ _id: bookId });

    if (!existing) throw new HttpError(404, "Book not found.");
    if (!canManageBook(existing, user.id, user.email)) {
      throw new HttpError(403, "You can only edit books you added.");
    }

    const updates: Partial<BookDocument> = { updatedAt: new Date() };
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.author !== undefined) updates.author = parsed.data.author;
    if (parsed.data.category !== undefined)
      updates.category = parsed.data.category;
    if (parsed.data.image !== undefined) updates.image = parsed.data.image;
    if (parsed.data.description !== undefined)
      updates.description = parsed.data.description;
    if (parsed.data.totalCopies !== undefined)
      updates.totalCopies = parsed.data.totalCopies;

    const updated = await books.findOneAndUpdate(
      { _id: bookId },
      { $set: updates },
      { returnDocument: "after", includeResultMetadata: false }
    );

    if (!updated) throw new HttpError(404, "Book not found.");
    res.json(toBookResponse(updated));
  })
);

// ৬. DELETE /:id (বই ডিলিট করা)
booksRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const db = await getDb();
    const bookId = parseBookId(req.params.id);
    const books = db.collection<BookDocument>("books");
    const existing = await books.findOne({ _id: bookId });

    if (!existing) throw new HttpError(404, "Book not found.");
    if (!canManageBook(existing, user.id, user.email)) {
      throw new HttpError(403, "You can only delete books you added.");
    }

    const activeBorrows = await db
      .collection("borrows")
      .countDocuments({ bookId, status: "active" });

    if (activeBorrows > 0) {
      throw new HttpError(
        409,
        "This book is currently borrowed. Wait for it to be returned before deleting it."
      );
    }

    await books.deleteOne({ _id: bookId });
    res.json({ message: "Book deleted successfully." });
  })
);