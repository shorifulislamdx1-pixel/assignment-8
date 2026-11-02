import fs from "node:fs";
import { MongoClient } from "mongodb";

const BASE = "http://localhost:3100";
const EMAIL_A = "e2e-api-test-a@booknook.test";
const EMAIL_B = "e2e-api-test-b@booknook.test";
const PASSWORD = "TestPass123!e2e";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

let failures = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name} :: ${JSON.stringify(detail)}`);
  }
}

async function json(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function signup(email, name) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD, name }),
  });
  const body = await json(res);
  const cookies = (res.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  return { status: res.status, body, cookies };
}

async function getToken(cookies) {
  const res = await fetch(`${BASE}/api/token`, { headers: { cookie: cookies } });
  const body = await json(res);
  return { status: res.status, token: body?.token, body };
}

async function api(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, data: await json(res) };
}

const iso = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

async function cleanup() {
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const db = client.db(env.MONGODB_DB || "booknook");
  const users = await db
    .collection("user")
    .find({ email: { $in: [EMAIL_A, EMAIL_B] } })
    .toArray();
  const ids = users.map((u) => u.id ?? u._id.toString()).filter(Boolean);
  const deleted = {};
  if (ids.length) {
    deleted.sessions = (await db.collection("session").deleteMany({ userId: { $in: ids } })).deletedCount;
    deleted.accounts = (await db.collection("account").deleteMany({ userId: { $in: ids } })).deletedCount;
    deleted.books = (await db.collection("books").deleteMany({ userId: { $in: ids } })).deletedCount;
    deleted.borrows = (await db.collection("borrows").deleteMany({ userId: { $in: ids } })).deletedCount;
  }
  deleted.users = (await db.collection("user").deleteMany({ email: { $in: [EMAIL_A, EMAIL_B] } })).deletedCount;
  await client.close();
  return deleted;
}

async function run() {
  // 1. Auth setup
  const a = await signup(EMAIL_A, "E2E User A");
  const b = await signup(EMAIL_B, "E2E User B");
  check("signup A 200", a.status === 200, a.status);
  check("signup B 200", b.status === 200, b.status);

  const ta = await getToken(a.cookies);
  const tb = await getToken(b.cookies);
  check("/api/token A 200 + token", ta.status === 200 && typeof ta.token === "string", ta.status);
  check("/api/token B 200 + token", tb.status === 200 && typeof tb.token === "string", tb.status);

  // 2. Public list filters (ported logic: q, category, sort, limit)
  const byQ = await api("/books?q=dune&limit=5");
  check(
    "GET /books?q=dune finds Dune only",
    byQ.status === 200 && Array.isArray(byQ.data) && byQ.data.length >= 1 && byQ.data.every((x) => /dune|frank/i.test(x.title + x.author)),
    byQ.data?.map?.((x) => x.title)
  );
  const byCat = await api("/books?category=Science&sort=title&limit=5");
  check(
    "GET /books?category=Science&sort=title",
    byCat.status === 200 && byCat.data.length > 0 && byCat.data.every((x) => x.category === "Science"),
    byCat.data?.map?.((x) => x.title)
  );
  const regexMeta = await api("/books?q=a.b(c)%5B");
  check("GET /books?q=regex-meta does not 500", regexMeta.status === 200, regexMeta.status);

  // 3. Mine starts empty
  const mine0 = await api("/books/mine", { token: ta.token });
  check("GET /books/mine A initial 200 []", mine0.status === 200 && Array.isArray(mine0.data) && !mine0.data.some((x) => x.title.startsWith("E2E Test Book")), mine0.data?.length);

  // 4. Create
  const created = await api("/books", {
    method: "POST",
    token: ta.token,
    body: {
      title: "E2E Test Book",
      author: "Test Author",
      category: "Fiction",
      image: "https://example.com/e2e.jpg",
      description: "A description that is long enough for the schema.",
      totalCopies: 2,
    },
  });
  check("POST /books 201", created.status === 201 && created.data?._id, created);
  const bookId = created.data?._id;
  check("POST /books response shape", created.data?.userId && created.data?.userEmail === EMAIL_A && created.data?.userName === "E2E User A" && created.data?.totalCopies === 2, created.data);

  // 5. Validation
  const invalid = await api("/books", {
    method: "POST",
    token: ta.token,
    body: { title: "x", author: "y", category: "Nope", image: "x", description: "short", totalCopies: 0 },
  });
  check("POST /books invalid -> 400 zod message", invalid.status === 400 && typeof invalid.data?.message === "string", invalid);

  // 6. Mine contains it, detail works
  const mine1 = await api("/books/mine", { token: ta.token });
  check("GET /books/mine A includes created", mine1.status === 200 && mine1.data.some((x) => x._id === bookId), mine1.data?.map?.((x) => x.title));
  const detail = await api(`/books/${bookId}`);
  check("GET /books/:id 200", detail.status === 200 && detail.data._id === bookId, detail.status);

  // 7. Cross-user permissions
  const bPatch = await api(`/books/${bookId}`, { method: "PATCH", token: tb.token, body: { title: "Hijacked" } });
  check("PATCH other user's book -> 403", bPatch.status === 403 && bPatch.data?.message === "You can only edit books you added.", bPatch);
  const bDelete = await api(`/books/${bookId}`, { method: "DELETE", token: tb.token });
  check("DELETE other user's book -> 403", bDelete.status === 403 && bDelete.data?.message === "You can only delete books you added.", bDelete);

  // 8. Update
  const patched = await api(`/books/${bookId}`, { method: "PATCH", token: ta.token, body: { title: "E2E Test Book Updated", totalCopies: 1 } });
  check("PATCH own book 200 + updated", patched.status === 200 && patched.data?.title === "E2E Test Book Updated" && patched.data?.totalCopies === 1, patched.data);

  // 9. Borrow lifecycle
  const selfBorrow = await api("/borrows", { method: "POST", token: ta.token, body: { bookId, returnDate: iso(10) } });
  check("A cannot borrow own book -> 400", selfBorrow.status === 400 && /cannot borrow a book you added/i.test(selfBorrow.data?.message ?? ""), selfBorrow);

  const past = await api("/borrows", { method: "POST", token: tb.token, body: { bookId, returnDate: iso(-1) } });
  check("Borrow past date -> 400", past.status === 400, past);

  const tooFar = await api("/borrows", { method: "POST", token: tb.token, body: { bookId, returnDate: iso(90) } });
  check("Borrow > 60 days -> 400", tooFar.status === 400, tooFar);

  const borrowed = await api("/borrows", { method: "POST", token: tb.token, body: { bookId, returnDate: iso(10) } });
  check("B POST /borrows 201", borrowed.status === 201 && borrowed.data?._id && borrowed.data?.bookId === bookId, borrowed.data);
  const borrowId = borrowed.data?._id;

  const dup = await api("/borrows", { method: "POST", token: tb.token, body: { bookId, returnDate: iso(10) } });
  check("Duplicate borrow -> 409", dup.status === 409, dup);

  const afterBorrow = await api(`/books/${bookId}`);
  check("Book copies decremented to 0", afterBorrow.status === 200 && afterBorrow.data.totalCopies === 0, afterBorrow.data?.totalCopies);

  const exhausted = await api("/borrows", { method: "POST", token: ta.token, body: { bookId, returnDate: iso(10) } });
  check("No copies left -> 409 (not own-book error)", exhausted.status === 409, exhausted);

  const deleteWhileBorrowed = await api(`/books/${bookId}`, { method: "DELETE", token: ta.token });
  check("Delete borrowed book -> 409", deleteWhileBorrowed.status === 409, deleteWhileBorrowed);

  const listB = await api("/borrows", { token: tb.token });
  check("GET /borrows B lists active borrow", listB.status === 200 && listB.data.some((x) => x._id === borrowId), listB.data?.length);
  const listA = await api("/borrows", { token: ta.token });
  check("GET /borrows A does not include B's borrow", listA.status === 200 && !listA.data.some((x) => x._id === borrowId), listA.data?.length);

  const returnRes = await api(`/borrows/${borrowId}`, { method: "DELETE", token: tb.token });
  check("DELETE /borrows/:id 200", returnRes.status === 200 && /returned successfully/i.test(returnRes.data?.message ?? ""), returnRes);
  const afterReturn = await api(`/books/${bookId}`);
  check("Copies restored to 1", afterReturn.data?.totalCopies === 1, afterReturn.data?.totalCopies);

  const badBorrowId = await api(`/borrows/${borrowId}`, { method: "DELETE", token: tb.token });
  check("DELETE missing borrow -> 404", badBorrowId.status === 404, badBorrowId);

  // 10. Delete own book works now
  const deleted = await api(`/books/${bookId}`, { method: "DELETE", token: ta.token });
  check("DELETE own book 200", deleted.status === 200 && /deleted successfully/i.test(deleted.data?.message ?? ""), deleted);
  const gone = await api(`/books/${bookId}`);
  check("Deleted book -> 404", gone.status === 404, gone);
}

try {
  await run();
} catch (error) {
  failures += 1;
  console.error("E2E CRASH:", error);
} finally {
  const deleted = await cleanup();
  console.log("cleanup:", JSON.stringify(deleted));
}

console.log(failures === 0 ? "ALL E2E CHECKS PASSED" : `${failures} E2E CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
