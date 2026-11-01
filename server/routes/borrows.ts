import { Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "../db";
import { asyncHandler, HttpError, requireAuth } from "../middleware";
import type { BookDocument, BorrowDocument } from "../types";

export const borrowsRouter = Router();

const createBorrowSchema = z.object({
  bookId: z.string().trim().min(1, "A book is required."),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid return date."),
});

const toBorrowResponse = (borrow: BorrowDocument) => ({
  ...borrow,
  _id: borrow._id?.toString(),
  bookId: borrow.bookId.toString(),
  borrowDate: borrow.borrowDate.toISOString(),
  returnDate: borrow.returnDate.toISOString(),
});

borrowsRouter.use(requireAuth);

borrowsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const user = req.user!;
    const result = await db
      .collection<BorrowDocument>("borrows")
      .find({
        $or: [{ userId: user.id }, { userEmail: user.email }],
        status: "active",
      })
      .sort({ borrowDate: -1 })
      .toArray();

    res.json(result.map(toBorrowResponse));
  })
);

borrowsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createBorrowSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Invalid borrow request."
      );
    }

    const { bookId: rawBookId, returnDate } = parsed.data;
    if (!ObjectId.isValid(rawBookId)) {
      throw new HttpError(404, "Book not found.");
    }

    const today = new Date().toISOString().slice(0, 10);
    if (returnDate < today) {
      throw new HttpError(400, "The return date cannot be in the past.");
    }

    const maxReturn = new Date();
    maxReturn.setUTCDate(maxReturn.getUTCDate() + 60);
    if (returnDate > maxReturn.toISOString().slice(0, 10)) {
      throw new HttpError(400, "Books can be borrowed for up to 60 days.");
    }

    const user = req.user!;
    const db = await getDb();
    const books = db.collection<BookDocument>("books");
    const borrows = db.collection<BorrowDocument>("borrows");
    const bookId = new ObjectId(rawBookId);
    const book = await books.findOne({ _id: bookId });

    if (!book) throw new HttpError(404, "Book not found.");
    if (book.userId === user.id || book.userEmail === user.email) {
      throw new HttpError(400, "You cannot borrow a book you added.");
    }

    const existingBorrow = await borrows.findOne({
      bookId,
      status: "active",
      $or: [{ userId: user.id }, { userEmail: user.email }],
    });

    if (existingBorrow) {
      throw new HttpError(409, "You already have this book borrowed.");
    }

    const available = await books.updateOne(
      { _id: bookId, totalCopies: { $gt: 0 } },
      { $inc: { totalCopies: -1 }, $set: { updatedAt: new Date() } }
    );

    if (available.modifiedCount !== 1) {
      throw new HttpError(
        409,
        "All copies of this book are currently borrowed. Check back soon."
      );
    }

    const borrow: BorrowDocument = {
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookImage: book.image,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      borrowDate: new Date(),
      returnDate: new Date(`${returnDate}T12:00:00.000Z`),
      status: "active",
    };

    try {
      const inserted = await borrows.insertOne(borrow);
      res.status(201).json(
        toBorrowResponse({ ...borrow, _id: inserted.insertedId })
      );
    } catch (error) {
      // Restore the copy if the borrow record could not be created.
      await books.updateOne(
        { _id: bookId },
        { $inc: { totalCopies: 1 }, $set: { updatedAt: new Date() } }
      );

      if (error instanceof Error && "code" in error && error.code === 11000) {
        throw new HttpError(409, "You already have this book borrowed.");
      }
      throw error;
    }
  })
);

borrowsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      throw new HttpError(404, "Borrow record not found.");
    }

    const user = req.user!;
    const db = await getDb();
    const borrows = db.collection<BorrowDocument>("borrows");
    const borrow = await borrows.findOneAndDelete({
      _id: new ObjectId(id),
      $or: [{ userId: user.id }, { userEmail: user.email }],
      status: "active",
    });

    if (!borrow) {
      throw new HttpError(404, "Active borrow record not found.");
    }

    await db.collection<BookDocument>("books").updateOne(
      { _id: borrow.bookId },
      { $inc: { totalCopies: 1 }, $set: { updatedAt: new Date() } }
    );

    res.json({ message: "Book returned successfully." });
  })
);
