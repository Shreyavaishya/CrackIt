"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}
// lib/actions/auth.action.ts

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRef = db.collection("users").doc(uid);
    
    // 1. Wrap the lookup safely
    let userExists = false;
    try {
      const userRecord = await userRef.get();
      userExists = userRecord.exists;
    } catch (e: any) {
      // If collection doesn't exist yet in fresh DB, ignore 5 NOT_FOUND
      if (e?.code !== 5) throw e;
    }

    if (userExists) {
      return {
        success: false,
        message: "User already exists.",
      };
    }

    // 2. Create the user document (This will automatically create the 'users' collection!)
    await userRef.set({
      name,
      email,
      userId: uid,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log("");

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) return null;

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    if (!decodedClaims?.uid) return null;

    let userDoc;
    try {
      userDoc = await db.collection("users").doc(decodedClaims.uid).get();
    } catch (dbError: any) {
      console.error("Firestore user fetch error:", dbError?.message);
      return null;
    }

    if (!userDoc || !userDoc.exists) return null;

    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}