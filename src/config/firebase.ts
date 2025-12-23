import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC0hxHXJtwhW599pYWevOerGbTV9B3WGcU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sciolytics-fcee6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sciolytics-fcee6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sciolytics-fcee6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "9188897701",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:9188897701:web:1f6525d8a3e8a7eacd2e4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// OAuth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

