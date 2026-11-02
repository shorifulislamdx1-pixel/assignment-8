import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import {
  type BookDocument,
  type BorrowDocument,
  createBorrowSchema,
  getDb,
  handleApiError,
  HttpError,
  readJsonBody,
  requireApiUser,
  toBorrowResponse,
} from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    const db = await getDb();
    const result = await db
      .collection<BorrowDocument>("borrows")
      .find({
        $or: [{ userId: user.id }, { userEmail: user.email }],
        status: "active",
      })
      .sort({ borrowDate: -1 })
      .toArray();

    return NextResponse.json(result.map(toBorrowResponse));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    // express.json() ran before auth in the original API, so parse first.
    const body = await readJsonBody(request);
    const user = await requireApiUser(request);

    const parsed = createBorrowSchema.safeParse(body);
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
      return NextResponse.json(
        toBorrowResponse({ ...borrow, _id: inserted.insertedId }),
        { status: 201 }
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
  } catch (error) {
    return handleApiError(error);
  }
}
