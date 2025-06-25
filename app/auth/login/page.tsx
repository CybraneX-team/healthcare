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
import { auth } from '@/utils/firebase'

type Step = 'email' | 'password' | '2fa' | 'error' | 'success'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithApple, loginWithGoogle } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

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

  //  useLayoutEffect(() => {
  //  const unsubscribe = onAuthStateChanged(auth, (user) => {
  //    if (user) {
  //      toast.info("You are already logged in!");
  //      router.replace("/dashboard");
  //    }
  //  });

  //  return () => unsubscribe();
  // }, [router, auth]);

  const handleNext = () => {
    if (currentStep === 'email') {
      if (!email.trim()) {
        setError('Please enter your email address')
        return
      }

      // Add proper email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      setCurrentStep('password')
      setError(null)
    } else if (currentStep === 'password') {
      if (!password.trim()) {
        setError('Please enter your password')
        return
      }

      // Simulate checking if 2FA is enabled
      const has2FA = false // This would be determined by your API

      if (has2FA) {
        setCurrentStep('2fa')
      } else {
        // Here you would normally call an API to login
        handleLogin()
      }
      setError(null)
    } else if (currentStep === '2fa') {
      if (!twoFactorCode.trim() || twoFactorCode.length !== 6) {
        setError('Please enter a valid 6-digit code')
        return
      }

      handleLogin()
      setError(null)
    }
  }

  // Use the keyboard navigation hook
  useKeyboardNavigation(handleNext, [
    currentStep,
    email,
    password,
    twoFactorCode,
  ])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await login(email, password)

      // Redirect to the component dashboard page
      router.push('/dashboard')
    } catch (err) {
      setCurrentStep('error')
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
    if (currentStep === 'password') {
      setCurrentStep('email')
    } else if (currentStep === '2fa') {
      setCurrentStep('password')
    } else if (currentStep === 'error') {
      setCurrentStep('email')
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
      className=" rounded-2xl p-8"
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
            Log in to access your healthcare dashboard
          </motion.p>
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <AnimatePresence
          initial={false}
          custom={currentStep === 'email' ? 1 : -1}
        >
          {currentStep === 'email' && (
            <motion.div
              key="email"
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
                  <Inputbox
                    id="email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'password' && (
            <motion.div
              key="password"
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
                  <Inputbox
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
              <p className="text-sm text-right mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </p>
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
                  <Inputbox
                    id="2fa"
                    type="text"
                    label="Two-factor authentication code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full"
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
        {currentStep === 'email' && (
          <Button
            onClick={handleNext}
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {currentStep === 'password' && (
          <div className="flex space-x-2">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {currentStep === '2fa' && (
          <div className="flex space-x-2">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              Log in
            </Button>
          </div>
        )}

        {currentStep === 'error' && (
          <Button
            onClick={handleBack}
            className="w-full bg-blue-500 hover:bg-blue-600"
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
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleAppleSignIn}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
          </svg>
          <span>Sign in with Apple</span>
        </Button>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
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
