// Firebase configuration and utility functions
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  GoogleAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  deleteField,
  where,
  getDocs,
  query,
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { getDatabase } from 'firebase/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
let analytics: any = null

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

// Email & Password Authentication
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const createUserWithEmail = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password)
}

// Apple Authentication
export const signInWithApple = async (): Promise<UserCredential> => {
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')

  const result = await signInWithPopup(auth, provider)
  const user = result.user

  const existing = await getUserProfile(user.uid)
  if (!existing) {
    await createUserProfile(user.uid, {
      email: user.email,
      fullName: user.displayName,
      photoURL: user.photoURL,
      provider: 'apple',
    })
  }

  return result
}


// Sign out
export const signOut = async (): Promise<void> => {
  return auth.signOut()
}

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser
}

// Firestore User Operations
export const createUserProfile = async (
  userId: string,
  userData: any,
): Promise<void> => {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export const getUserProfile = async (userId: string): Promise<any> => {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return userSnap.data()
  }
  return null
}

export const updateUserProfile = async (
  userId: string,
  userData: any,
): Promise<void> => {
  const userRef = doc(db, 'users', userId)
  await setDoc(
    userRef,
    {
      ...userData,
      updatedAt: new Date(),
    },
    { merge: true },
  ) // ✅ merge ensures it won't overwrite the whole document
}

// Firebase Storage Operations
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  const path = `avatars/${userId}`
  return uploadFile(file, path)
}

export async function uploadUserDocument(
  userId: string,
  file: File,
  folder: string,
) {
  const storage = getStorage()
  const fileName = `${Date.now()}-${file.name}`
  const storageRef = ref(storage, `documents/${userId}/${folder}/${fileName}`)

  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  // 🔥 Return BOTH the downloadURL and fileName
  return { downloadURL, fileName }
}

export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email)
}

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  // Optional: check if the user already exists to avoid overwriting
  const existing = await getUserProfile(user.uid)
  if (!existing) {
    await createUserProfile(user.uid, {
      email: user.email,
      fullName : user.displayName,
      photoURL: user.photoURL,
      provider: 'google',
    })
  }

  return result
}


export const saveUserProgress = async (
  userId: string,
  programId: string,
  progressData: any,
) => {
  const progressRef = doc(db, `users/${userId}/progress/${programId}`)
  await setDoc(progressRef, progressData, { merge: true })
}

export const getUserProgress = async (userId: string, programId: string) => {
  const progressRef = doc(db, `users/${userId}/progress/${programId}`)
  const snapshot = await getDoc(progressRef)
  if (snapshot.exists()) {
    return snapshot.data()
  }
  return null
}

export const deleteUserFile = async (
  userId: string,
  category: string,
  fileId: string,
  fullStorageName: string, // this is the actual file name with timestamp
) => {
  // 1️⃣ Remove from Firestore
  const userDocRef = doc(db, 'users', userId)
  await updateDoc(userDocRef, {
    [`${category}.${fileId}`]: deleteField(),
  })

  // 2️⃣ Remove from Storage
  const filePath = `documents/${userId}/${category}/${fullStorageName}`
  const fileRef = ref(storage, filePath)
  await deleteObject(fileRef)
}

export const giveLoggedInUser = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return
  return user
}


export async function checkUserExists(email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      uid: doc.id,
      data: doc.data()
    };
  }

  return null;
}

export const rtdb = getDatabase(app)
export { app, auth, db, storage, analytics }
