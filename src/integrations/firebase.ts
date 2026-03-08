import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pet-ecommerce-16f65.firebaseapp.com",
  projectId: "pet-ecommerce-16f65",
  storageBucket: "pet-ecommerce-16f65.firebasestorage.app",
  messagingSenderId: "747622733704",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginWithEmail = (email: string, password: string): Promise<UserCredential> =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email: string, password: string): Promise<UserCredential> =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = (): Promise<UserCredential> =>
  signInWithPopup(auth, googleProvider);

export const loginWithFacebook = (): Promise<UserCredential> =>
  signInWithPopup(auth, facebookProvider);

export const logout = (): Promise<void> => signOut(auth);
