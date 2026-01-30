import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfyKNhIB1HPjvrw0YWxCjdL1sWfwXvILM",
  authDomain: "fbtestproject-efe8a.firebaseapp.com",
  projectId: "fbtestproject-efe8a",
  storageBucket: "fbtestproject-efe8a.firebasestorage.app",
  messagingSenderId: "215782749895",
  appId: "1:215782749895:web:f7ab6cf07f67d1d4ccb0e2"
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
