import path from "node:path";
import dotenv from "dotenv";

// The Next.js app and the API share one env file during local development.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: numberFromEnv(process.env.API_PORT || process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  databaseName: process.env.MONGODB_DB || "booknook",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtIssuer: process.env.JWT_ISSUER || "booknook-web",
  jwtAudience: process.env.JWT_AUDIENCE || "booknook-api",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  publicApiUrl: (process.env.API_PUBLIC_URL || "").replace(/\/$/, ""),
};

if (!config.jwtSecret) {
  throw new Error(
    "JWT_SECRET is missing. Add it to .env.local before starting the BookNook API."
  );
}
