'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Settings, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.fullName) return 'U'
    return user.fullName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="relative z-[60]" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="rounded-full p-0 w-14 h-14"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="w-12 h-12 border border-gray-200">
          <AvatarImage
            src={user?.avatar || ''}
            alt={user?.fullName || 'User'}
          />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 z-50 min-w-[240px] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-3 px-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={user?.avatar || ''}
                    alt={user?.fullName || 'User'}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {user?.fullName || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg mb-1"
                onClick={() => {
                  setIsOpen(false)
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg mb-1"
                onClick={() => {
                  router.push('/dashboard?tab=upload')
                  setIsOpen(false)
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Health Records</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
