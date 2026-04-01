import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDpA2YYgcY3Yf1VnNlg0KX7sDaQF8P5dKw",
  authDomain: "med-clarity-6cb83.firebaseapp.com",
  projectId: "med-clarity-6cb83",
  storageBucket: "med-clarity-6cb83.firebasestorage.app",
  messagingSenderId: "861109282344",
  appId: "1:861109282344:web:b54b10708dac2db733b71d",
  measurementId: "G-HMT4P3ZRRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
