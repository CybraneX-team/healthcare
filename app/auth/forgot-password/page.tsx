'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Inputbox } from '@/components/ui/inputbox'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await resetPassword(email)
      setMessage('Password reset email sent. Check your inbox.')
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full"
    >
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      <p className="text-sm text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <Inputbox
        id="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4"
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {message && <p className="text-green-500 text-sm mb-2">{message}</p>}

      <Button onClick={handleSubmit} className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Remembered your password?{' '}
        <button
          className="text-blue-600 hover:underline"
          onClick={() => router.push('/auth/login')}
        >
          Back to Login
        </button>
      </p>
    </motion.div>
  )
}
