// Firebase configuration and utility functions
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAv4E0bC7RnH9Hcrf8wkb7oNAvLvLcWx4",
  authDomain: "healthcare-6313f.firebaseapp.com",
  projectId: "healthcare-6313f",
  storageBucket: "healthcare-6313f.firebasestorage.app",
  messagingSenderId: "805457948615",
  appId: "1:805457948615:web:9b713dc7896c6f418373e2",
  measurementId: "G-8EMDLE14RD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let analytics: any = null;

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Email & Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Apple Authentication
export const signInWithApple = async (): Promise<UserCredential> => {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  
  return signInWithPopup(auth, provider);
};

// Sign out
export const signOut = async (): Promise<void> => {
  return auth.signOut();
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export { app, auth, analytics }; 