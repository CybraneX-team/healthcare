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
import { toast } from "react-toastify";

export interface User {
  id: string
  email: string | null
  fullName: string | null
  avatar?: string | null
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
    skipRedirect?: boolean;
  setSkipRedirect?: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipRedirect, setSkipRedirect] = useState(false);
  const router = useRouter();

  // Check if user is logged in when the app loads and listen for auth state changes
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
    const currentPath = window.location.pathname;
       

    if (firebaseUser) {
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
      };
      setUser(userData);

      const isAuthPage =
        currentPath.startsWith("/auth/login") ||
        currentPath.startsWith("/auth/signup");

      // ✅ Only redirect if skipRedirect is false AND loading is finished

      if (!skipRedirect) {
        if (isAuthPage) {
            if (!firebaseUser.emailVerified) {
            // redirect to verify email page
            router.replace("/auth/verify-email");
            return;
            }
          router.replace("/dashboard");
        } else if (currentPath.startsWith("/dashboard")) {
          const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
          if (navEntry?.type !== "reload") {
            // Optional: toast here
          }
        }
      }
    } else {
      setUser(null);

      const shouldRedirect =
        currentPath.startsWith("/dashboard") || currentPath.startsWith("/auth/logout");

      if (!skipRedirect && shouldRedirect) {
        router.replace("/auth");
      }
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, [router, skipRedirect]);


  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if email is in valid format
      if (!email || !email.includes('@') || !email.includes('.')) {
        throw new Error("Invalid email format. Please enter a valid email address.");
      }
      
      const userCredential = await signInWithEmail(email, password);
         const user = userCredential.user;

      if (!user.emailVerified) {
        await firebaseSignOut(); 
        throw new Error("Please verify your email address before logging in.");
      }
      

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

      console.log("userDataWithoutAvatar", userDataWithoutAvatar)

      await createUserProfile(user.uid, {
        email: user.email,
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        emailVerified: false, // Initially false
        ...userDataWithoutAvatar,
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
        isAuthenticated: !!user,
        skipRedirect,
        setSkipRedirect
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