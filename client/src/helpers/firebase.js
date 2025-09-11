import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getEvn } from "./getEnv";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEvn("VITE_FIREBASE_API"),
  authDomain:
    getEvn("VITE_FIREBASE_AUTH_DOMAIN") || "tusiwawasahau.firebaseapp.com",
  projectId: getEvn("VITE_FIREBASE_PROJECT_ID") || "tusiwawasahau",
  storageBucket:
    getEvn("VITE_FIREBASE_STORAGE_BUCKET") ||
    "tusiwawasahau.firebasestorage.app",
  messagingSenderId:
    getEvn("VITE_FIREBASE_MESSAGING_SENDER_ID") || "404272240278",
  appId:
    getEvn("VITE_FIREBASE_APP_ID") ||
    "1:404272240278:web:6fe4c3058ee8b63a9dd4b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, storage, db };
