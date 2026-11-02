import { NextResponse, type NextRequest } from "next/server";
import type { Filter, Sort } from "mongodb";
import {
  BOOK_CATEGORIES,
  type BookCategory,
  type BookDocument,
  createBookSchema,
  escapeRegExp,
  getDb,
  handleApiError,
  HttpError,
  readJsonBody,
  requireApiUser,
  toBookResponse,
} from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const books = db.collection<BookDocument>("books");

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "";
    const search = (searchParams.get("q") || "").trim().slice(0, 120);
    const sort = searchParams.get("sort") || "newest";
    const rawLimitParam = searchParams.get("limit");
    const rawLimit =
      rawLimitParam === null ? Number.NaN : Number(rawLimitParam);
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

    return NextResponse.json(result.map(toBookResponse));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    // express.json() ran before auth in the original API, so parse first.
    const body = await readJsonBody(request);
    const user = await requireApiUser(request);

    const parsed = createBookSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Invalid book details."
      );
    }

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
    return NextResponse.json(
      toBookResponse({ ...book, _id: result.insertedId }),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
