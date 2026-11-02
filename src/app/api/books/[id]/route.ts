import { NextResponse, type NextRequest } from "next/server";
import {
  type BookDocument,
  canManageBook,
  getDb,
  handleApiError,
  HttpError,
  parseBookId,
  readJsonBody,
  requireApiUser,
  toBookResponse,
  updateBookSchema,
} from "@/lib/api-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const db = await getDb();
    const book = await db
      .collection<BookDocument>("books")
      .findOne({ _id: parseBookId(id) });

    if (!book) throw new HttpError(404, "Book not found.");
    return NextResponse.json(toBookResponse(book));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    // express.json() ran before auth in the original API, so parse first.
    const body = await readJsonBody(request);
    const user = await requireApiUser(request);

    const parsed = updateBookSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Invalid book details."
      );
    }

    const db = await getDb();
    const books = db.collection<BookDocument>("books");
    const bookId = parseBookId(id);
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
    return NextResponse.json(toBookResponse(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await requireApiUser(request);
    const db = await getDb();
    const bookId = parseBookId(id);
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
    return NextResponse.json({ message: "Book deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
