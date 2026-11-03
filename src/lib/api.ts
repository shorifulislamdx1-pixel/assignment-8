const TOKEN_STORAGE_KEY = "booknook_api_token";

interface StoredToken {
  token: string;
  expiresAt: number;
}

let tokenRequest: Promise<StoredToken | null> | null = null;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readStoredToken(): StoredToken | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      typeof parsed?.token !== "string" ||
      !parsed.token ||
      typeof parsed?.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }

    return parsed as StoredToken;
  } catch {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Storage may be unavailable.
    }
    return null;
  }
}

function storeToken(token: StoredToken) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify(token)
    );
  } catch {
    // Continue without persistent token caching.
  }
}

export function clearApiToken() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
}

async function requestToken(): Promise<StoredToken | null> {
  try {
    const response = await fetch("/api/token", {
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) return null;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        "We could not create a secure API session. Please try again."
      );
    }

    const data = await response.json();

    if (
      typeof data?.token !== "string" ||
      !data.token.trim()
    ) {
      throw new ApiError(500, "Invalid API token response.");
    }

    const expiresIn =
      typeof data.expiresIn === "number" &&
      Number.isFinite(data.expiresIn) &&
      data.expiresIn > 0
        ? data.expiresIn
        : 3600;

    const expiresInMs = expiresIn * 1000;

    const stored: StoredToken = {
      token: data.token,
      expiresAt:
        Date.now() + Math.max(expiresInMs - 60_000, 30_000),
    };

    storeToken(stored);
    return stored;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      503,
      "The BookNook service is unavailable. Please try again in a moment."
    );
  }
}

export async function getApiToken(
  forceRefresh = false
): Promise<string | null> {
  if (forceRefresh) {
    clearApiToken();
    tokenRequest = null;
  } else {
    const cached = readStoredToken();
    if (cached) return cached.token;
  }

  if (!tokenRequest) {
    const request = requestToken();
    tokenRequest = request;

    request
      .finally(() => {
        if (tokenRequest === request) {
          tokenRequest = null;
        }
      })
      .catch(() => {
        // Prevent unhandled rejection from cleanup.
      });
  }

  const stored = await tokenRequest;
  return stored?.token || null;
}

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

async function parseError(response: Response): Promise<string> {
  let message = "Something went wrong. Please try again.";

  try {
    const data = await response.json();

    if (typeof data?.message === "string") {
      message = data.message;
    }

    if (
      process.env.NODE_ENV !== "production" &&
      data?.stack
    ) {
      console.error("SERVER STACK TRACE:", data.stack);
    }
  } catch {
    if (response.status === 401) {
      message = "Please sign in to continue.";
    }
  }

  return message;
}

function buildApiUrl(path: string): string {
  const endpoint = path.startsWith("/") ? path : `/${path}`;

  // All production API endpoints are implemented as Next.js route handlers.
  // A same-origin URL works on localhost, Vercel production, and previews.
  return `/api${endpoint}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();

  if (!text) return undefined as T;

  return text as T;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  // সাধারণ /books পাবলিক রিকোয়েস্ট ছাড়া বাকি সব সুরক্ষিত এন্ডপয়েন্টে auth ডিফল্টভাবে true
  const isPublicBooksEndpoint = path === "/books" || path.startsWith("/books?");
  const defaultAuth = !isPublicBooksEndpoint;
  const { auth = defaultAuth, ...init } = options;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let token: string | null = null;

    if (auth) {
      token = await getApiToken(attempt > 0);

      if (!token) {
        throw new ApiError(
          401,
          "Your session has expired. Please sign in again."
        );
      }
    } else {
      // পাবলিক রিকোয়েস্ট হলেও যদি ইউজারের টোকেন থাকে, তা পাঠিয়ে দেওয়া ভালো
      token = readStoredToken()?.token || null;
    }

    const headers = new Headers(init.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    if (
      init.body &&
      typeof init.body === "string" &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;

    try {
      response = await fetch(buildApiUrl(path), {
        ...init,
        headers,
        cache: "no-store",
      });
    } catch {
      throw new ApiError(
        503,
        "Could not reach the BookNook API. Make sure the server is running."
      );
    }

    if (response.status === 401 && auth && attempt === 0) {
      clearApiToken();
      continue;
    }

    if (!response.ok) {
      const errText = await parseError(response);

      console.error(
        `API FAIL [${response.status}] on ${path}:`,
        errText
      );

      throw new ApiError(response.status, errText);
    }

    return parseResponse<T>(response);
  }

  throw new ApiError(
    401,
    "Your session has expired. Please sign in again."
  );
}

export async function uploadBookCover(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new ApiError(400, "Please select a valid image.");
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getApiToken(attempt > 0);

    if (!token) {
      throw new ApiError(
        401,
        "Please sign in before uploading a cover."
      );
    }

    const formData = new FormData();
    formData.append("image", file);

    let response: Response;

    try {
      response = await fetch(buildApiUrl("/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        cache: "no-store",
      });
    } catch {
      throw new ApiError(
        503,
        "Could not reach the BookNook API to upload your cover."
      );
    }

    if (response.status === 401 && attempt === 0) {
      clearApiToken();
      continue;
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        await parseError(response)
      );
    }

    const data = await parseResponse<{ url: string }>(response);

    if (!data || typeof data.url !== "string" || !data.url) {
      throw new ApiError(
        500,
        "The server returned an invalid cover image URL."
      );
    }

    return data.url;
  }

  throw new ApiError(
    401,
    "Your session has expired. Please sign in again."
  );
}