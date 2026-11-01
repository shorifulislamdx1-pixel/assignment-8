import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config";
import type { ApiUser, AuthTokenPayload } from "./types";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const asyncHandler =
  (
    handler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    }) as AuthTokenPayload;

    if (!payload.sub || !payload.email) {
      res.status(401).json({ message: "Invalid authentication token." });
      return;
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      image: payload.image ?? null,
    } satisfies ApiUser;

    next();
  } catch {
    res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "The requested API route does not exist." });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(">>> REAL BACKEND ERROR:", error);

  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ message: "The request body is not valid JSON." });
    return;
  }

  if (
    error instanceof Error &&
    error.name === "MulterError" &&
    "code" in error
  ) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "The image is too large. Please choose a file under 5 MB."
        : "The image could not be uploaded.";
    res.status(400).json({ message });
    return;
  }

  // আসল এরর মেসেজটি রেসপন্সে পাঠানো হচ্ছে যাতে রুট কজ স্পষ্ট বোঝা যায়
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  const stack = error instanceof Error ? error.stack : undefined;

  res.status(500).json({
    message: errorMessage,
    stack,
  });
};