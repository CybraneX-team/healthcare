'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getAuth } from 'firebase/auth'

const Inputbox = ({
  id,
  type,
  label,
  value,
  onChange,
  autoFocus,
}: {
  id: string
  type: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoFocus?: boolean
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      className="w-full border-b border-gray-300 focus:border-blue-400 focus:outline-none py-1 transition-colors duration-200 text-gray-800"
    />
  </div>
)

export default function PromoteToAdminPage() {
  const [email, setEmail] = useState('')
  const [superuserPass, setSuperuserPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handlePromote = async () => {
    if (!email.trim() || !superuserPass.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // ✅ Get current user's UID (logged-in user)
      const auth = getAuth()
      const currentUser = auth.currentUser
      if (!currentUser) {
        setError('You must be logged in to promote yourself.')
        setLoading(false)
        return
      }

      const uid = currentUser.uid

      // ✅ Call API route
      const res = await fetch('/api/promote-to-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superuserPass,
          email, // pass the email (API will find the UID using email, if needed)
          uid, // pass UID of current user (who is self-promoting)
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('You are now an admin!')
        router.push('/dashboard')
      } else {
        setError(data.error || 'An unexpected error occurred.')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred.')
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
      className="max-w-md mx-auto mt-20 p-8 min-h-[500px]"
    >
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 2V5M16 2V5M3.5 9.08984H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13.5V17.5M10 15.5H14"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-gray-800 mb-1"
          >
            Promote to Admin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-sm"
          >
            Enter your email and superuser password
          </motion.p>
        </div>
      </div>

      <div className="space-y-6 my-6">
        <Inputbox
          id="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <Inputbox
          id="superuserPass"
          type="password"
          label="Superuser Password"
          value={superuserPass}
          onChange={(e) => setSuperuserPass(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handlePromote}
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'AUTHENTICATING...' : 'Grant Access'}
        </Button>
      </div>
    </motion.div>
  )
}
