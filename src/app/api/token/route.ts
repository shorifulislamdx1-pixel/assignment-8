import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Server misconfiguration: JWT_SECRET missing." },
        { status: 500 }
      );
    }

    const payload = {
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: "7d",
      issuer: process.env.JWT_ISSUER || "booknook-web",
      audience: process.env.JWT_AUDIENCE || "booknook-api",
    });

    return NextResponse.json({
      token,
      expiresIn: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { message: "Could not create API token." },
      { status: 500 }
    );
  }
}