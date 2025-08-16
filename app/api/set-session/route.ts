import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  const cookieStore = cookies();

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  (await cookieStore).set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ success: true });
}
