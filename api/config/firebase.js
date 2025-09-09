import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase (même que le client)
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tusiwawasahau.firebaseapp.com",
  projectId: "tusiwawasahau",
  // Correct bucket domain for Firebase Storage (googleapis domain)
  storageBucket: "tusiwawasahau.appspot.com",
  messagingSenderId: "404272240278",
  appId: "1:404272240278:web:6fe4c3058ee8b63a9dd4b7",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
