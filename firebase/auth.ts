
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const auth = getAuth();

export {
    getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
