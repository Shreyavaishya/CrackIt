
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const auth = getAuth();
const user = auth.currentUser;

const userId = user?.uid;
const userName = user?.displayName || user?.email || "Anonymous";

export {
  userId,
  userName,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
