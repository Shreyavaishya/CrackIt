
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error("❌ Firebase Admin config is invalid:", serviceAccount);
  throw new Error("Missing Firebase Admin credentials");
}

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
console.log("🔥 Admin config loaded:", {
  projectId: serviceAccount.projectId,
  clientEmail: serviceAccount.clientEmail,
  privateKeyStartsWith: serviceAccount.privateKey?.slice(0, 30),
});
