import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, name, email } = await req.json();
    console.log("🔎 Trying to fetch user from Firestore using uid:", uid);

    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists) {
      return Response.json({
        success: false,
        message: "User already exists.",
      });
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return Response.json({
      success: false,
      message: "Something went wrong.",
    });
  }
}
