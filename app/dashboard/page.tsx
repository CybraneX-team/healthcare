"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/dashboard";
import DashboardMobile from "@/components/dashboard-mobile";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    // Skip this check in development mode
    if (!loading && !isAuthenticated && !isDevelopment) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router, isDevelopment]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show nothing while loading or if not authenticated (except in development)
  if ((loading || !isAuthenticated) && !isDevelopment) {
    return null;
  }

  // Render the appropriate dashboard based on screen size
  return isMobile ? <DashboardMobile /> : <Dashboard />;
} 