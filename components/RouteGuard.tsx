"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Authentication check
    authCheck(pathname);
  }, [pathname, isAuthenticated, loading]);

  function authCheck(url: string) {
    // Skip auth check during initial loading to prevent flashes
    if (loading) return;

    // Define protected routes
    const protectedPaths = ['/dashboard'];
    const isProtectedPath = protectedPaths.some(path => 
      url.startsWith(path)
    );

    // In development, allow access to all routes
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isProtectedPath && !isAuthenticated && !isDevelopment) {
      // Not authenticated, redirect to login
      setAuthorized(false);
      router.push('/auth/login');
    } else {
      // Authenticated or accessing public route
      setAuthorized(true);
    }
  }

  return authorized ? <>{children}</> : null;
} 