"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmail, 
  signInWithApple, 
  createUserWithEmail, 
  signOut as firebaseSignOut,
  getCurrentUser,
  signInWithGoogle ,
  auth,
  createUserProfile,
  uploadAvatar,
  updateUserProfile
} from "@/utils/firebase";
import { resetPassword as firebaseResetPassword } from "@/utils/firebase";
import { sendEmailVerification } from "firebase/auth";

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
  resetPassword: (email: string) => Promise<void>;
   loginWithGoogle: () => Promise<void>;
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
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        avatar: firebaseUser.photoURL
      };
      setUser(userData);

      // 🚀 Only if on /auth/login or /auth/signup, show toast and redirect
      const isAuthPage = window.location.pathname.startsWith("/auth/login") ||
                         window.location.pathname.startsWith("/auth/signup");

      if (isAuthPage) {
        import("react-toastify").then(({ toast }) => {
          toast.info("You are already logged in!");
        });

        router.replace("/dashboard");
      }
    } else {
      // User is signed out
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 'dev-user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          avatar: null
        });
      } else {
        setUser(null);
      }
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, [router]);


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

  const resetPassword = async (email: string) => {
  try {
    await firebaseResetPassword(email);
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
};

const loginWithGoogle = async () => {
  setLoading(true);
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error("Google login failed:", error);
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
    const userCredential = await createUserWithEmail(email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Save profile (excluding avatar initially)
    if (userData) {
      const { avatar, ...userDataWithoutAvatar } = userData;

      await createUserProfile(user.uid, {
        email: user.email,
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        ...userDataWithoutAvatar,
        emailVerified: false, // Initially false
      });

      if (avatar && avatar instanceof File) {
        try {
          const avatarUrl = await uploadAvatar(user.uid, avatar);
          await updateUserProfile(user.uid, { avatarUrl });
        } catch (uploadError) {
          console.error("Avatar upload failed:", uploadError);
        }
      }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithApple,
        signup,
        logout,
        resetPassword,
         loginWithGoogle,
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