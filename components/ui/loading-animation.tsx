import React from 'react'
import { motion } from 'framer-motion'

interface LoadingAnimationProps {
  title: string
  description?: string
  variant?: 'blue' | 'green'
  showSpinner?: boolean
}

export function LoadingAnimation({
  title,
  description,
  variant = 'blue',
  showSpinner = true,
}: LoadingAnimationProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300 border-t-blue-600',
      title: 'text-blue-900',
      description: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-300 border-t-green-600',
      title: 'text-green-900',
      description: 'text-green-600',
    },
  }

  const currentColors = colors[variant]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className={`${currentColors.bg} rounded-2xl p-10 text-center flex flex-col items-center max-w-md`}
      >
        {showSpinner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
              className={`h-16 w-16 rounded-full border-4 ${currentColors.border}`}
            />
          </motion.div>
        )}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-xl font-semibold ${currentColors.title} mb-2`}
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={currentColors.description}
          >
            {description}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}
