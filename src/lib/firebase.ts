// // // // Import the functions you need from the SDKs you need
// // import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// // import { getFirestore } from "firebase/firestore";

// // // Your web app's Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAHY1jsIzEBwyJTQ6RRUiVDXRQ9CYEXqNU",
// //   authDomain: "manofcave-v1.firebaseapp.com",
// //   projectId: "manofcave-v1",
// //   storageBucket: "manofcave-v1.firebasestorage.app",
// //   messagingSenderId: "886275055938",
// //   appId: "1:886275055938:web:15926c5f0c5d967e04e8db",
// //   measurementId: "G-5EBK1WG97T"
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);

// // // Initialize Firestore
// // export const db = getFirestore(app);

// // // Initialize Analytics (optional, only if you need it)
// // let analytics;
// // if (typeof window !== 'undefined') {
// //   analytics = getAnalytics(app);
// // }

// // // Export analytics if needed
// // export { analytics };
// // new cod
// // lib/firebase.ts
// //Import the functions you need from the SDKs you need
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


