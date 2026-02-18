import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7HNYJN5wEo6m9sqszLvwsDVNJj_MNEb4",
  authDomain: "repair-cafe-f-hain.firebaseapp.com",
  projectId: "repair-cafe-f-hain",
  storageBucket: "repair-cafe-f-hain.firebasestorage.app",
  messagingSenderId: "176866837629",
  appId: "1:176866837629:web:0af3c5c6f8ac4840089d14",
  measurementId: "G-P0YRY838F1"
};

// Check if Firebase config is valid (not placeholder values)
const isConfigValid = firebaseConfig.apiKey !== "AIzaSyDummyKeyReplaceWithReal" && 
                      firebaseConfig.messagingSenderId !== "123456789" &&
                      firebaseConfig.appId !== "1:123456789:web:abcdef";

let app, auth, db, googleProvider;

try {
  // Initialize Firebase only if config is valid
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn('Firebase not configured. Please update src/firebase.js with your Firebase configuration.');
    // Create mock objects to prevent errors
    auth = null;
    db = null;
    googleProvider = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };
export default app;
