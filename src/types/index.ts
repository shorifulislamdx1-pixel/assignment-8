import { BOOK_CATEGORIES, BookCategory } from "@/lib/constants";

export { BOOK_CATEGORIES };
export type { BookCategory };

export interface Book {
  _id: string;
  title: string;
  author: string;
  category: BookCategory;
  image: string;
  description: string;
  totalCopies: number;
  userEmail: string;
  userName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookImage: string;
  userEmail: string;
  userName?: string;
  borrowDate: string;
  returnDate: string;
  returned?: boolean;
}