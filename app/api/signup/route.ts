import { NextResponse } from "next/server";
import { signUp } from "@/lib/actions/auth.action";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await signUp(body); // { uid, name, email }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
