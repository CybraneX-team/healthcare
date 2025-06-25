'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ArrowRight, Heart, Shield, Activity } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/utils/firebase'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard')
      }
      // Else, do nothing (let them stay on this page)
    })

    // Cleanup the subscription on unmount
    return () => unsubscribe()
  }, [router])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8 text-center"
    >
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center shadow-sm"
        >
          <div className="w-14 h-14 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3L18 5.6V11.5C18 15.7 15.6 19.5 12 21C8.4 19.5 6 15.7 6 11.5V5.6L12 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 11.5L11 13L14.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
          Healthcare Dashboard
        </h1>
        <p className="text-gray-600 mb-2">
          Your personal health information center
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="w-2 h-2 rounded-full bg-blue-300"></span>
        </div>
      </div>

      <div className="mb-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative"
        >
          <Image
            src="/healthcare-illustration.svg"
            alt="Healthcare Illustration"
            width={300}
            height={220}
            priority
            className="mx-auto"
          />
        </motion.div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 text-blue-600">
            <Shield size={18} />
          </div>
          <span className="text-xs text-gray-600">Secure Access</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 text-blue-600">
            <Heart size={18} />
          </div>
          <span className="text-xs text-gray-600">Health Records</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 text-blue-600">
            <Activity size={18} />
          </div>
          <span className="text-xs text-gray-600">Care Insights</span>
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Button
            variant="default"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium h-12 text-base shadow-sm"
            onClick={() => router.push('/auth/login')}
          >
            Login
            {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium h-12 text-base"
            onClick={() => router.push('/auth/signup')}
          >
            Create Account
          </Button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-1"
      >
        <Shield size={12} className="inline-block text-blue-400" />
        <span>Secure access to your health records</span>
      </motion.p>
    </motion.div>
  )
}
