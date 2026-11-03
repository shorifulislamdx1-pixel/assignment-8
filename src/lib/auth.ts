
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

const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const vercelDeploymentUrl = process.env.VERCEL_URL;

const vercelAppUrl =
  process.env.VERCEL_ENV === "production" && vercelProductionUrl
    ? `https://${vercelProductionUrl}`
    : vercelDeploymentUrl
      ? `https://${vercelDeploymentUrl}`
      : undefined;

const configuredAuthUrl =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

function getAppOrigin(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

const appUrl =
  (process.env.VERCEL_ENV === "production"
    ? getAppOrigin(configuredAuthUrl) || getAppOrigin(vercelAppUrl)
    : getAppOrigin(configuredAuthUrl) || getAppOrigin(vercelAppUrl)) ||
  "http://localhost:3000";

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://assignment-8-mauve-three.vercel.app",
      appUrl,
      getAppOrigin(configuredAuthUrl),
      getAppOrigin(process.env.NEXT_PUBLIC_APP_URL),
      getAppOrigin(vercelAppUrl),
      vercelProductionUrl
        ? `https://${vercelProductionUrl}`
        : undefined,
      vercelDeploymentUrl
        ? `https://${vercelDeploymentUrl}`
        : undefined,
    ].filter((origin): origin is string => Boolean(origin))
  )
);

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

  trustedOrigins,

  database: mongodbAdapter(db),

  plugins: [jwt()],

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
