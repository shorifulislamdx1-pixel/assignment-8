import type { ObjectId } from "mongodb";
import type { JwtPayload } from "jsonwebtoken";

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

export interface AuthTokenPayload extends JwtPayload {
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

declare global {
  namespace Express {
    interface Request {
      user?: ApiUser;
    }
  }
}
