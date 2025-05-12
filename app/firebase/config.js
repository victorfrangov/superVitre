import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyA34fozyhNrFpoy6rEFRr6Um3M43cwwLx0",
  authDomain: "supervitre-3a19e.firebaseapp.com",
  projectId: "supervitre-3a19e",
  storageBucket: "supervitre-3a19e.firebasestorage.app",
  messagingSenderId: "67184412597",
  appId: "1:67184412597:web:d5ed3593252890550b7bfc",
  measurementId: "G-5HM2GE18GS"
};

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app);

export {app, auth, db}
