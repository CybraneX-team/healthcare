// app/auth/verify-email/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Verify Your Email</h1>
      <p className="text-gray-600 max-w-md mb-6">
        We've sent a verification link to your email. Please click the link to
        activate your account. You can log in once your email is verified.
      </p>
      <Button
        onClick={() => {
          setLoading(true)
          router.push('/auth/login')
        }}
        disabled={loading}
      >
        Go to Login
      </Button>
    </div>
  )
}
