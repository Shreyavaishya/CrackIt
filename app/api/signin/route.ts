// app/api/signin/route.ts
import { NextResponse } from "next/server";
import { signIn } from "@/lib/actions/auth.action";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await signIn(body); // { email, idToken }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
