
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const globalForMongo = globalThis as typeof globalThis & {
  bookNookMongoClient?: MongoClient;
};

const client =
  globalForMongo.bookNookMongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.bookNookMongoClient = client;
}

const db = client.db(process.env.MONGODB_DB || "booknook");

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
);

const githubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET
);

export const auth = betterAuth({
  appName: "BookNook",

  baseURL: appUrl,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [appUrl],

  database: mongodbAdapter(db),

  plugins: [
    jwt(),
  ],

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  socialProviders: {
    ...(googleConfigured
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            prompt: "select_account" as const,
          },
        }
      : {}),

    ...(githubConfigured
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
});
