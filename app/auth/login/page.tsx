'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Inputbox } from '@/components/ui/inputbox'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { onAuthStateChanged } from 'firebase/auth'
import {
  auth,
  signInWithEmail,
  signOut as firebaseSignOut,
  getUserProfile,
  checkUserExists,
} from '@/utils/firebase'
import { sendOtpToEmail } from '@/app/mailUtils/sendOtpFromMail'
import { verifyOtpCode } from '@/app/mailUtils/verifyOtpCode'

type Step = 'login' | '2fa' | 'error' | 'success'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithApple, loginWithGoogle, setSkipRedirect } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [tempUid, setTempUid] = useState<string | null>(null)
  const [tempSecret, setTempSecret] = useState<string | null>(null)

  useEffect(() => {
    // Check if user was redirected from setup completion
    const setup = searchParams.get('setup')
    if (setup === 'complete') {
      setSetupComplete(true)
      // Show the success message for 3 seconds
      setTimeout(() => {
        setSetupComplete(false)
      }, 3000)
    }
  }, [searchParams])

  const checkUserReady = async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject('Login timeout'), 5000)
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          clearTimeout(timeout)
          unsubscribe()
          resolve()
        }
      })
    })
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await login(email, password)
      // Wait for Firebase to fully recognize login
      await checkUserReady() // ✅ ensure auth state is updated
      router.push('/dashboard')
    } catch (err: any) {
      setCurrentStep('error')
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 'login') {
      // First check if user exists
      const userExists = await checkUserExists(email)
      if (!userExists || !userExists.uid) {
        toast.error('No user found')
        return
      }
      setTempUid(userExists.uid) // Store UID early for later use

      try {
        // Check user profile BEFORE logging in
        const profile = await getUserProfile(userExists.uid)

        if (profile?.use2FA) {
          await sendOtpToEmail(userExists.uid, email)
          setCurrentStep('2fa')
          return
        }

        // No 2FA → log in normally
        await handleLogin()
      } catch (err: any) {
        toast.error(err.message)
      }
    } else if (currentStep === '2fa') {
      try {
        await verifyOtpCode(tempUid ? tempUid : '', twoFactorCode) // ✅ OTP verified
        await login(email, password) // ✅ Log in
        await checkUserReady() // ✅ Wait for Firebase to sync
        router.push('/dashboard') // ✅ Redirect
      } catch (err: any) {
        toast.error(err.message || 'Invalid code')
      }
    }
  }

  // Use the keyboard navigation hook
  useKeyboardNavigation(handleNext, [
    currentStep,
    email,
    password,
    twoFactorCode,
  ])

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginWithApple()
      router.push('/dashboard')
    } catch (err) {
      setError('Apple sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      router.push('/dashboard')
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === '2fa') {
      setCurrentStep('login')
    } else if (currentStep === 'error') {
      setCurrentStep('login')
    }
    setError(null)
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8"
    >
      {setupComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 text-green-800 p-4 mb-6 rounded-lg flex items-center"
        >
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          <div>
            <p className="font-medium">Setup completed successfully!</p>
            <p className="text-sm">Please login to access your dashboard.</p>
          </div>
        </motion.div>
      )}

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
              d="M8 2V5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 2V5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 9.08984H20.5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13.5V17.5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 15.5H14"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeMiterlimit="10"
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
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-sm"
          >
            Log in to access your Thrivemed dashboard
          </motion.p>
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ height: '280px' }}>
        <AnimatePresence
          initial={false}
          custom={currentStep === 'login' ? 1 : -1}
        >
          {currentStep === 'login' && (
            <motion.div
              key="login"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:border-transparent placeholder-gray-500 transition-all duration-200"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:border-transparent placeholder-gray-500 transition-all duration-200"
                    />
                  </div>
                </div>
                {/* <p className="text-sm text-right mt-2">
                  <Link
                    href="/auth/forgot-password"
                    className="text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </p> */}
              </div>
            </motion.div>
          )}

          {currentStep === '2fa' && (
            <motion.div
              key="2fa"
              custom={-1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    id="2fa"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Two-factor authentication code"
                    className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'error' && (
            <motion.div
              key="error"
              custom={-1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                  <p>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && currentStep !== 'error' && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}

      <div className="mt-8 space-y-4">
        {currentStep === 'login' && (
          <Button
            onClick={handleNext}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 text-lg rounded-2xl"
            disabled={isLoading || !email || !password}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {currentStep === '2fa' && (
          <div className="flex space-x-2">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 py-3 rounded-2xl"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-500 hover:bg-blue-600 py-3 rounded-2xl"
              disabled={isLoading}
            >
              Log in
            </Button>
          </div>
        )}

        {currentStep === 'error' && (
          <Button
            onClick={handleBack}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-2xl"
            disabled={isLoading}
          >
            Try Again
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            fill="currentColor"
          >
            <path
              d="M44.5 20H24v8.5h11.7C34.6 33.4 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.2 5.3 29.4 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 20-7.8 20-21 0-1.3-.2-2.3-.5-4z"
              fill="#FFC107"
            />
            <path
              d="M6.3 14.6l6.6 4.8C14.3 16.1 18.8 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.2 5.3 29.4 3 24 3 16 3 9.2 7.8 6.3 14.6z"
              fill="#FF3D00"
            />
            <path
              d="M24 45c5.3 0 10.1-1.8 13.9-4.9l-6.4-5.2C29.8 36.5 27 37 24 37c-6.1 0-11.2-3.9-13-9.3l-6.6 5C9.2 40.2 16 45 24 45z"
              fill="#4CAF50"
            />
            <path
              d="M44.5 20H24v8.5h11.7C34.9 33.6 30 37 24 37c-6.1 0-11.2-3.9-13-9.3l-6.6 5C9.2 40.2 16 45 24 45c10.5 0 20-7.8 20-21 0-1.3-.2-2.3-.5-4z"
              fill="#1976D2"
            />
          </svg>
          <span>Sign in with Google</span>
        </Button>
      </div>
    </motion.div>
  )
}
