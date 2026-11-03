import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Keep authentication same-origin. Better Auth's API route lives at
// /api/auth on this Next.js deployment, so do not point the browser at a
// localhost or a separate Vercel preview URL.
export const authClient = createAuthClient({
  plugins: [jwtClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
