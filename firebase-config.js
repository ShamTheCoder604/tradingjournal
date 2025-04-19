// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcAUB1jY7_D4Bh27omjl1RNwRe112z7iU",
  authDomain: "shamstradingjourney.firebaseapp.com",
  projectId: "shamstradingjourney",
  storageBucket: "shamstradingjourney.firebasestorage.app",
  messagingSenderId: "974388489062",
  appId: "1:974388489062:web:14b23d225b4687fb8236a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
