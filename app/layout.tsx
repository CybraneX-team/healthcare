import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"
import { RouteGuard } from "@/components/RouteGuard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Healthcare Dashboard",
  description: "A modern healthcare dashboard for managing your health information",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
