import { NextResponse, type NextRequest } from "next/server";
import {
  type BookDocument,
  getDb,
  handleApiError,
  requireApiUser,
  toBookResponse,
} from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    const db = await getDb();
    const books = db.collection<BookDocument>("books");

    const result = await books
      .find({
        $or: [{ userId: user.id }, { userEmail: user.email }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(result.map(toBookResponse));
  } catch (error) {
    return handleApiError(error);
  }
}
