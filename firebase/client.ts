import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlPPyektJIN5nZUnPGvlx4oB94PivFhlQ",
  authDomain: "crackit-2c47a.firebaseapp.com",
  projectId: "crackit-2c47a",
  storageBucket: "crackit-2c47a.firebasestorage.app",
  messagingSenderId: "976281519900",
  appId: "1:976281519900:web:eeb6043e13a970abbe9cd9",
  measurementId: "G-HVXYWX7L8B"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);