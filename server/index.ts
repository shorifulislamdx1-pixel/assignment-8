import fs from "node:fs";
import express from "express";
import cors from "cors";
import { config } from "./config";
import { closeDb, getDb } from "./db";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware";
import { booksRouter } from "./routes/books";
import { borrowsRouter } from "./routes/borrows";
import { UPLOADS_DIR, uploadRouter } from "./routes/upload";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "7d",
    immutable: true,
    fallthrough: false,
  })
);

app.get("/", (_req, res) => {
  res.json({
    name: "BookNook API",
    version: "1.0.0",
    status: "ok",
    endpoints: ["/books", "/borrows", "/upload"],
  });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/books", booksRouter);
app.use("/borrows", borrowsRouter);
app.use("/upload", uploadRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function ensureIndexes() {
  const db = await getDb();
  await Promise.all([
    db.collection("books").createIndex({ createdAt: -1 }),
    db.collection("books").createIndex({ userId: 1 }),
    db.collection("books").createIndex({ userEmail: 1 }),
    db.collection("borrows").createIndex({ userId: 1, status: 1 }),
    db.collection("borrows").createIndex({ userEmail: 1, status: 1 }),
    db.collection("borrows").createIndex({ bookId: 1, status: 1 }),
    db.collection("borrows").createIndex(
      { userId: 1, bookId: 1 },
      {
        unique: true,
        partialFilterExpression: { status: "active" },
        name: "one_active_borrow_per_user_and_book",
      }
    ),
  ]);
}

async function start() {
  await ensureIndexes();
  const server = app.listen(config.port, () => {
    console.log(`[BookNook API] Running at http://localhost:${config.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("[BookNook API] Failed to start:", error);
  process.exit(1);
});
