import { NextResponse } from "next/server";
import { handleApiError, HttpError, requireApiUser } from "@/lib/api-server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    await requireApiUser(request);

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw new HttpError(400, "Choose an image to upload.");
    }
    if (image.size > MAX_IMAGE_SIZE) {
      throw new HttpError(400, "The image is too large. Please choose a file under 5 MB.");
    }
    if (!ALLOWED_TYPES.has(image.type)) {
      throw new HttpError(400, "Please upload a JPG, PNG, WebP, or GIF image.");
    }

    const apiKey =
      process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new HttpError(500, "Image upload is not configured. Add IMGBB_API_KEY in Vercel.");
    }

    const uploadData = new FormData();
    uploadData.append("image", image, image.name || "book-cover");

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      }
    );

    const result = await uploadResponse.json().catch(() => null);
    const imageUrl = result?.data?.display_url;

    if (!uploadResponse.ok || typeof imageUrl !== "string") {
      console.error("ImgBB upload failed:", result);
      throw new HttpError(502, "The image hosting service could not upload this cover.");
    }

    return NextResponse.json({ url: imageUrl }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
