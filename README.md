# BookNook – A Small Online Library

**Live Site:** https://assignment-8-mauve-three.vercel.app

BookNook is an online library platform where users can explore books, add their own books, borrow books, and return them easily.

## Features

- Browse all books and view detailed information.
- Register and log in using Email/Password or Google.
- Add, update, and delete books.
- Borrow books and manage borrowed books.
- Track borrowing and return dates.
- Manage available copies and prevent duplicate borrowing.
- Responsive design for mobile, tablet, and desktop.
- Dark and Light theme support.
- Toast notifications for success and error messages.

## Technologies Used

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Better Auth
- MongoDB
- JWT
- imgbb
- Vercel

## Local Development

1. Copy `.env.example` to `.env.local` and fill in the required values.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The Next.js app serves Better Auth endpoints at `/api/auth`, JWT exchange at `/api/token`, and books, borrows, and upload API routes under `/api`.

Browser authentication is same-origin. Do not set the auth client to a localhost or separate API deployment URL.

## Vercel Deployment

Deploy this folder as the Next.js project root.

Add the following Environment Variables in Vercel:

- `MONGODB_URI`
- `MONGODB_DB`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `JWT_SECRET`
- `JWT_ISSUER=booknook-web`
- `JWT_AUDIENCE=booknook-api`
- `IMGBB_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional GitHub OAuth variables:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Set `NEXT_PUBLIC_APP_URL` to your canonical site origin if required.

`BETTER_AUTH_URL` should contain only your canonical site origin, for example:

`https://your-domain.vercel.app`

After changing environment variables, redeploy the Vercel project.

## Security

Never commit `.env.local`, `.env`, OAuth secrets, database credentials, or JWT secrets.

If a real secret is accidentally committed or shared, rotate it immediately.

## Author

Developed as a BookNook library management project.