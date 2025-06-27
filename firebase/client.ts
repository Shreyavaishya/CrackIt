// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);