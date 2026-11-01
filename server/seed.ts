import { MongoClient } from "mongodb";
import { config } from "./config";
import type { BookCategory, BookDocument } from "./types";

type SeedBook = Omit<
  BookDocument,
  "userId" | "userEmail" | "userName" | "createdAt" | "updatedAt"
> & { ageInDays: number };

const books: SeedBook[] = [
  {
    seedKey: "the-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    image: "/covers/the-great-gatsby.jpg",
    description:
      "A glittering portrait of the Jazz Age and one man's impossible pursuit of the past. Nick Carraway is drawn into the lavish world of his mysterious neighbour, Jay Gatsby, where every party hides a longing.",
    totalCopies: 4,
    ageInDays: 1,
  },
  {
    seedKey: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    image: "/covers/sapiens.jpg",
    description:
      "From the first sparks of imagination to the connected world we inhabit today, Sapiens traces the astonishing story of how one species came to shape the planet.",
    totalCopies: 5,
    ageInDays: 2,
  },
  {
    seedKey: "a-brief-history-of-time",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    image: "/covers/a-brief-history-of-time.jpg",
    description:
      "A landmark journey through the biggest questions in cosmology, written with remarkable clarity. Black holes, the origin of the universe, and the nature of time await.",
    totalCopies: 3,
    ageInDays: 3,
  },
  {
    seedKey: "the-midnight-library",
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    image: "/covers/the-midnight-library.jpg",
    description:
      "Between life and death there is a library. Each book offers Nora Seed a chance to try another life she might have lived, and to discover what truly makes a life worth living.",
    totalCopies: 6,
    ageInDays: 4,
  },
  {
    seedKey: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Others",
    image: "/covers/atomic-habits.jpg",
    description:
      "A practical guide to building better habits and breaking bad ones. Small, consistent changes compound into remarkable results when you design the right systems.",
    totalCopies: 7,
    ageInDays: 5,
  },
  {
    seedKey: "the-hobbit",
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    category: "Fiction",
    image: "/covers/the-hobbit.jpg",
    description:
      "Bilbo Baggins leaves the comfort of Bag End for a treasure-hunting adventure across Middle-earth. Trolls, riddles, a ring, and a dragon lie in wait.",
    totalCopies: 4,
    ageInDays: 6,
  },
  {
    seedKey: "educated",
    title: "Educated",
    author: "Tara Westover",
    category: "Others",
    image: "/covers/educated.jpg",
    description:
      "A memoir about a girl who grows up without formal schooling in rural Idaho and ultimately earns a doctorate from Cambridge, discovering the price of self-invention.",
    totalCopies: 3,
    ageInDays: 7,
  },
  {
    seedKey: "dune",
    title: "Dune",
    author: "Frank Herbert",
    category: "Fiction",
    image: "/covers/dune.jpg",
    description:
      "On the desert planet of Arrakis, young Paul Atreides becomes entangled in a struggle for power, survival, and the most valuable resource in the universe.",
    totalCopies: 5,
    ageInDays: 8,
  },
  {
    seedKey: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Fiction",
    image: "/covers/pride-and-prejudice.jpg",
    description:
      "Elizabeth Bennet and Mr Darcy move from first impressions to hard-won understanding in Austen's sparkling comedy of manners, family, and love.",
    totalCopies: 4,
    ageInDays: 9,
  },
  {
    seedKey: "charlottes-web",
    title: "Charlotte's Web",
    author: "E. B. White",
    category: "Kids",
    image: "/covers/charlottes-web.jpg",
    description:
      "Wilbur the pig is destined for the dinner table, until a clever spider named Charlotte spins a plan to save him. A tender story of friendship and courage.",
    totalCopies: 6,
    ageInDays: 10,
  },
];

async function seed() {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  const db = client.db(config.databaseName);
  const collection = db.collection<BookDocument>("books");
  const now = new Date();

  for (const { ageInDays, ...book } of books) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - ageInDays);

    await collection.updateOne(
      { seedKey: book.seedKey },
      {
        $setOnInsert: {
          ...book,
          category: book.category as BookCategory,
          userId: "booknook-curator",
          userEmail: "curator@booknook.app",
          userName: "BookNook Curator",
          createdAt,
          updatedAt: createdAt,
        },
      },
      { upsert: true }
    );
  }

  console.log(`[BookNook Seed] ${books.length} starter books are ready.`);
  await client.close();
}

seed().catch((error) => {
  console.error("[BookNook Seed] Failed:", error);
  process.exit(1);
});
