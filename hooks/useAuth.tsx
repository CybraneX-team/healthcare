"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmail, 
  signInWithApple, 
  createUserWithEmail, 
  signOut as firebaseSignOut,
  getCurrentUser,
  auth
} from "@/utils/firebase";
import {
  saveUserProfile,
  getUserProfile,
  uploadAvatar,
  uploadDocument,
  getUserDocuments,
  UserData
} from "@/utils/user-data";

interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithApple: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  uploadUserAvatar: (file: File | string) => Promise<string>;
  uploadUserDocument: (file: File, category: string) => Promise<string>;
  getUserData: () => Promise<UserData | null>;
  getUserFiles: (category?: string) => Promise<any[]>;
  saveUserProfile: (userData: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in when the app loads and listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          avatar: firebaseUser.photoURL
        };
        setUser(userData);
      } else {
        // User is signed out
        
        // For development purposes only - remove in production
        // This sets a fake user when not authenticated, to test the UI
        if (process.env.NODE_ENV === 'development') {
          const devUser: User = {
            id: 'dev-user-123',
            email: 'test@example.com',
            fullName: 'Test User',
            avatar: null
          };
          setUser(devUser);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if email is in valid format
      if (!email || !email.includes('@') || !email.includes('.')) {
        throw new Error("Invalid email format. Please enter a valid email address.");
      }
      
      const userCredential = await signInWithEmail(email, password);
      // Auth state listener will update the user state
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async () => {
    setLoading(true);
    
    try {
      const userCredential = await signInWithApple();
      // Auth state listener will update the user state
    } catch (error) {
      console.error("Apple login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData?: any) => {
    setLoading(true);
    
    try {
      // Check if email is in valid format
      if (!email || !email.includes('@') || !email.includes('.')) {
        throw new Error("Invalid email format. Please enter a valid email address.");
      }
      
      // Create the user account with Firebase Auth
      const userCredential = await createUserWithEmail(email, password);
      const userId = userCredential.user.uid;
      
      // Store additional user data in Firestore
      if (userData) {
        // Process avatar if provided
        let avatarUrl: string | undefined = undefined;
        if (userData.avatar) {
          avatarUrl = await uploadAvatar(userId, userData.avatar);
        }
        
        // Save user profile data to Firestore
        await saveUserProfile(userId, {
          email,
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth,
          primaryDiagnosis: userData.primaryDiagnosis,
          medications: userData.medications,
          phone: userData.phone,
          avatarUrl
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      // Auth state listener will update the user state
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // Upload user avatar
  const uploadUserAvatar = async (file: File | string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    return uploadAvatar(user.id, file);
  };
  
  // Upload user document (PDF)
  const uploadUserDocument = async (file: File, category: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    return uploadDocument(user.id, file, category);
  };
  
  // Get user data from Firestore
  const getUserData = async (): Promise<UserData | null> => {
    if (!user) return null;
    return getUserProfile(user.id);
  };
  
  // Save user profile data (used for both initial signup and updates)
  const saveUserProfile = async (userId: string, userData: Partial<UserData>): Promise<void> => {
    try {
      await saveUserProfile(userId, userData);
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  };
  
  // Get user files from Firestore
  const getUserFiles = async (category?: string): Promise<any[]> => {
    if (!user) return [];
    return getUserDocuments(user.id, category);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithApple,
        signup,
        logout,
        isAuthenticated: !!user,
        uploadUserAvatar,
        uploadUserDocument,
        getUserData,
        getUserFiles,
        saveUserProfile: (userData: Partial<UserData>) => {
          if (!user) throw new Error("User not authenticated");
          return saveUserProfile(user.id, userData);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 