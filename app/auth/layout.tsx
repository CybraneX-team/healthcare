import { Metadata } from "next";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Healthcare Dashboard - Authentication",
  description: "Secure login and signup for your healthcare dashboard",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
      <div className="rounded-lg w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}
