"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in when the app loads
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // In a real app, you would check localStorage, cookies, or make an API call
        const storedUser = localStorage.getItem("healthcare_user");
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // In a real app, you would make an API call to your backend
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a fake user for demo purposes
      const user: User = {
        id: "user-123",
        email,
        fullName: "Demo User",
        avatar: null
      };
      
      setUser(user);
      localStorage.setItem("healthcare_user", JSON.stringify(user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setLoading(true);
    
    try {
      // In a real app, you would make an API call to your backend
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a user based on the provided data
      const user: User = {
        id: "user-" + Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        avatar: userData.avatar
      };
      
      setUser(user);
      localStorage.setItem("healthcare_user", JSON.stringify(user));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("healthcare_user");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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