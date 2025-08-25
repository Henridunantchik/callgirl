import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getEvn } from "./getEnv";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEvn("VITE_FIREBASE_API"),
  authDomain: "tusiwawasahau.firebaseapp.com",
  projectId: "tusiwawasahau",
  storageBucket: "tusiwawasahau.firebasestorage.app",
  messagingSenderId: "404272240278",
  appId: "1:404272240278:web:6fe4c3058ee8b63a9dd4b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure Google OAuth for better CORS compatibility
provider.setCustomParameters({
  prompt: "select_account",
  access_type: "offline",
  include_granted_scopes: true,
});

// Configure auth settings
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = false;

export { auth, provider };
