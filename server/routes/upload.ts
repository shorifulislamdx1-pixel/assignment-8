import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { HttpError, requireAuth } from "../middleware";

export const UPLOADS_DIR = path.resolve(process.cwd(), "server", "uploads");

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOADS_DIR),
  filename: (_req, file, callback) => {
    const extension = extensionByMimeType[file.mimetype] || ".jpg";
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensionByMimeType[file.mimetype]) {
      callback(new Error("Please upload a JPG, PNG, WebP, or GIF image."));
      return;
    }
    callback(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post(
  "/",
  requireAuth,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "Choose an image to upload.");
    }

    const baseUrl =
      config.publicApiUrl || `${req.protocol}://${req.get("host")}`;
    res.status(201).json({
      url: `${baseUrl}/uploads/${req.file.filename}`,
    });
  }
);
