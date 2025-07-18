import { Metadata } from 'next'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Healthcare Dashboard - Authentication',
  description: 'Secure login and signup for your healthcare dashboard',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Glass-style authentication container */}
      <div className="relative rounded-3xl w-full max-w-md p-8 bg-white/30 backdrop-blur-xs shadow-xl border border-white/20 z-10">
        {children}
      </div>
    </div>
  )
}
