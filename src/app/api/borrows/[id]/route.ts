import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import {
  type BookDocument,
  type BorrowDocument,
  getDb,
  handleApiError,
  HttpError,
  requireApiUser,
} from "@/lib/api-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      throw new HttpError(404, "Borrow record not found.");
    }

    const user = await requireApiUser(request);
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

    return NextResponse.json({ message: "Book returned successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
