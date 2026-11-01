import { MongoClient, type Db } from "mongodb";
import { config } from "./config";

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      client = new MongoClient(config.mongoUri);
      await client.connect();
      // সরাসরি 'booknook' ডেটাবেজে কানেক্ট
      db = client.db("booknook");
      return db;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  })();

  try {
    return await connecting;
  } catch (error) {
    connecting = null;
    client = null;
    throw error;
  }
}

export async function closeDb(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
  connecting = null;
}