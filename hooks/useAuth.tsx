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
      
      const userCredential = await createUserWithEmail(email, password);
      // Auth state listener will update the user state
      
      // Additional user data could be stored in Firestore or another database here
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithApple,
        signup,
        logout,
        isAuthenticated: !!user
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