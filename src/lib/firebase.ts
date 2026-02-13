import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✅ Storage import karein

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtS7JJROenakgAtcxpZiCBk119xM7gwt4",
  authDomain: "jambeauty-6937b.firebaseapp.com",
  projectId: "jambeauty-6937b",
  storageBucket: "jambeauty-6937b.firebasestorage.app",
  messagingSenderId: "728063190282",
  appId: "1:728063190282:web:43222b154e195a0dfc46f3",
  measurementId: "G-XQEMTM7SSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// ✅ Initialize Firebase Authentication
export const auth = getAuth(app);

// ✅ Initialize Firebase Storage - YEH IMPORTANT LINE ADD KAREIN
export const storage = getStorage(app);

// Initialize Analytics (optional, only if you need it)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export analytics if needed
export { analytics };


