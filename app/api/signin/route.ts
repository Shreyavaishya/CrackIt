import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, idToken } = await req.json();
    console.log("Received signin request:", { email, idToken });

    const decodedToken = await getAuth().verifyIdToken(idToken);
    console.log("Decoded token:", decodedToken);

    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return Response.json({ success: false, message: "User does not exist" });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Signin error:", error);
    return Response.json({ success: false, message: "Failed to sign in" });
  }
}

