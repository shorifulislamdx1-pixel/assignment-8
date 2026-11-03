# BookNook

## Local development

1. Copy `.env.example` to `.env.local` and fill in the required values.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

The Next.js app serves the Better Auth endpoints at `/api/auth`, the JWT exchange at
`/api/token`, and the books/borrows/upload API routes under `/api`. Browser
authentication is same-origin; do not set the auth client to a localhost or
separate API deployment URL.

## Vercel deployment

Deploy this folder as the Next.js project root. Add these Environment Variables
in Vercel for Production (and Preview if you use preview deployments):

- `MONGODB_URI`
- `MONGODB_DB`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` — canonical site origin only, e.g.
  `https://your-domain.vercel.app` (do not append `/api/auth`)
- `JWT_SECRET`
- `JWT_ISSUER=booknook-web`
- `JWT_AUDIENCE=booknook-api`
- `IMGBB_API_KEY` — required for book cover uploads
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — optional Google login
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — optional GitHub login

Set `NEXT_PUBLIC_APP_URL` to the canonical site origin if you use it elsewhere.
`NEXT_PUBLIC_API_URL` is only used for legacy `/uploads/...` image URLs; it is
not the Better Auth endpoint. Email/password login does not require OAuth keys.

After changing environment variables, redeploy the Vercel project.

## Security

Never commit `.env.local`, `.env`, OAuth secrets, database credentials, or JWT
secrets. If a real secret was accidentally committed or shared, rotate it.
