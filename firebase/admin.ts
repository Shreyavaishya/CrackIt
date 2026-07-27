import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Clean formatting for private key
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, "\n").trim().replace(/^["']|["']$/g, "")
  : undefined;

// // DEBUG: Print verification in server console
// console.log("--- FIREBASE ADMIN INIT CHECK ---");
// console.log("PROJECT_ID:", projectId ? "✅ Loaded" : "❌ MISSING");
// console.log("CLIENT_EMAIL:", clientEmail ? "✅ Loaded" : "❌ MISSING");
// console.log("PRIVATE_KEY:", privateKey ? `✅ Loaded (${privateKey.length} chars)` : "❌ MISSING");
// console.log("----------------------------------");

if (!getApps().length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("❌ Cannot initialize Firebase Admin: Missing environment variables.");
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const db = getFirestore();
export const auth = getAuth();