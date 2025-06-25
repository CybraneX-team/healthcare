import { Metadata } from 'next'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Healthcare Dashboard - Authentication',
  description: 'Secure login and signup for your healthcare dashboard',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-50 to-blue-100 z-0" />

      {/* Healthcare-themed decorative elements */}
      <div className="absolute inset-0 z-0">
        {/* Healthcare Illustrations */}
        {/* DNA Strand */}
        <div
          className="absolute -left-10 top-1/4 w-56 h-56 transform -rotate-12"
          style={{ opacity: 0.15 }}
        >
          <svg
            viewBox="0 0 190 292"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 w-full h-full"
          >
            <path
              d="M95 4V288"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path d="M20 44H170" stroke="currentColor" strokeWidth="3" />
            <path d="M20 84H170" stroke="currentColor" strokeWidth="3" />
            <path d="M20 124H170" stroke="currentColor" strokeWidth="3" />
            <path d="M20 164H170" stroke="currentColor" strokeWidth="3" />
            <path d="M20 204H170" stroke="currentColor" strokeWidth="3" />
            <path d="M20 244H170" stroke="currentColor" strokeWidth="3" />
            <circle cx="35" cy="44" r="6" fill="currentColor" />
            <circle cx="155" cy="44" r="6" fill="currentColor" />
            <circle cx="155" cy="84" r="6" fill="currentColor" />
            <circle cx="35" cy="84" r="6" fill="currentColor" />
            <circle cx="35" cy="124" r="6" fill="currentColor" />
            <circle cx="155" cy="124" r="6" fill="currentColor" />
            <circle cx="155" cy="164" r="6" fill="currentColor" />
            <circle cx="35" cy="164" r="6" fill="currentColor" />
            <circle cx="35" cy="204" r="6" fill="currentColor" />
            <circle cx="155" cy="204" r="6" fill="currentColor" />
            <circle cx="155" cy="244" r="6" fill="currentColor" />
            <circle cx="35" cy="244" r="6" fill="currentColor" />
          </svg>
        </div>

        {/* Heartbeat Line */}
        <div
          className="absolute top-1/3 right-0 w-96 h-20"
          style={{ opacity: 0.15 }}
        >
          <svg
            viewBox="0 0 400 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 w-full h-full"
          >
            <path
              d="M0,40 L30,40 L40,10 L55,70 L70,20 L80,60 L100,40 L120,40 L140,10 L160,40 L180,40 L190,20 L200,40 L220,40 L240,10 L260,70 L280,20 L290,40 L400,40"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Medical Staff Symbol */}
        <div
          className="absolute bottom-1/4 left-1/4 w-40 h-40 transform -rotate-6"
          style={{ opacity: 0.15 }}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 w-full h-full"
          >
            <path d="M50,10 L50,90" stroke="currentColor" strokeWidth="4" />
            <path
              d="M50,30 C50,30 65,25 65,50 C65,75 50,70 50,70"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M50,30 C50,30 35,25 35,50 C35,75 50,70 50,70"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle cx="50" cy="20" r="5" fill="currentColor" />
          </svg>
        </div>

        {/* Medical Cross Bottom Right */}
        <div
          className="absolute bottom-10 right-10 w-32 h-32"
          style={{ opacity: 0.15 }}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 w-full h-full"
          >
            <path
              d="M40,20 L60,20 L60,40 L80,40 L80,60 L60,60 L60,80 L40,80 L40,60 L20,60 L20,40 L40,40 Z"
              fill="currentColor"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          </svg>
        </div>

        {/* Scattered Plus Signs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-blue-600"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              opacity: 0.08 + Math.random() * 0.08,
              transform: `rotate(${Math.random() * 45}deg) scale(${0.5 + Math.random() * 0.5})`,
              width: '20px',
              height: '20px',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12,5 L12,19 M5,12 L19,12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}

        {/* Medicine Pills */}
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 transform rotate-45"
          style={{ opacity: 0.15 }}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 w-full h-full"
          >
            <rect
              x="15"
              y="35"
              width="70"
              height="30"
              rx="15"
              fill="currentColor"
            />
            <rect
              x="35"
              y="15"
              width="30"
              height="70"
              rx="15"
              fill="white"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Main content container with improved styling */}
      <div className="relative rounded-2xl w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] z-10 border border-blue-50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl"></div>
        {children}
      </div>
    </div>
  )
}
