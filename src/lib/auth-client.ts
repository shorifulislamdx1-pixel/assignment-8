
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// No explicit baseURL: better-auth resolves to the current origin's
// "/api/auth", so auth works identically on localhost, the canonical
// Vercel domain, and any deployment alias (an absolute URL here would
// make cross-origin requests that browsers block or refuse cookies for).
export const authClient = createAuthClient({
   baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    
  plugins: [
    jwtClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
