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

if (!getApps().length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("❌ Missing Firebase Admin environment variables.");
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

// Pass no arguments or explicit default to target default Firestore instance
export const db = getFirestore();
export const auth = getAuth();