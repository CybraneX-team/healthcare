import { auth, db, storage } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

// User data interface
export interface UserData {
  email: string;
  fullName: string;
  dateOfBirth?: Date;
  primaryDiagnosis?: string;
  medications?: string;
  phone?: string;
  avatarUrl?: string;
  documents?: Record<string, any[]>;
  documentUploadComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create or update user profile in Firestore
export const saveUserProfile = async (userId: string, userData: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    const timestamp = new Date();
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userData,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    } else {
      // Update existing user document
      await updateDoc(userRef, {
        ...userData,
        updatedAt: timestamp
      });
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Upload avatar image to Firebase Storage
export const uploadAvatar = async (userId: string, file: File | string): Promise<string> => {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Handle base64 data URL
      await uploadString(storageRef, file, 'data_url');
    } else if (file instanceof File) {
      // Handle File object
      await uploadBytes(storageRef, file);
    }
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with avatar URL
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
    }
    
    // Also update in Firestore
    await saveUserProfile(userId, {
      avatarUrl: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

// Upload PDF document to Firebase Storage
export const uploadDocument = async (userId: string, file: File, category: string): Promise<string> => {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `documents/${userId}/${category}/${filename}`);
    
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save document reference to Firestore
    const docRef = doc(collection(db, "users", userId, "documents"));
    await setDoc(docRef, {
      filename: file.name,
      originalName: file.name,
      fileUrl: downloadURL,
      category,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

// Get all documents for a user
export const getUserDocuments = async (userId: string, category?: string) => {
  try {
    const documentsRef = collection(db, "users", userId, "documents");
    
    let q;
    if (category) {
      q = query(documentsRef, where("category", "==", category));
    } else {
      q = query(documentsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return documents;
  } catch (error) {
    console.error("Error getting user documents:", error);
    throw error;
  }
}; 