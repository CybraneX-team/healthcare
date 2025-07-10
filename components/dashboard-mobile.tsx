'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  MoveUpRight,
  ChevronRight,
  ArrowRight,
  UploadCloud,
  Heart,
  Activity,
  FileText,
  User,
  MoreHorizontal,
  ChevronUp,
  X,
  Home,
  CheckCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import Course from '@/components/courseManage'
import { LabsSection } from './labSection'
import { ServicesProductsSection } from './ServicesSection'
import { ProfileDropdown } from '@/components/ui/profile-dropdown'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Drawer } from 'vaul'
import Neurology from '@/components/neurology'
import UploadPage from './upload'
import { useAuth } from '@/hooks/useAuth'

// Import mobile-specific styles directly
import '@/styles/dashboard-mobile.css'
import MobileAnatomy from '@/components/anatomy-mobile'
import ReproductiveHealth from '@/components/reproductive-health'
import FoodIntakeModal from '@/components/FoodIntakeModal'

// Import organ components
import HeartComponent from '@/components/heart-component'
import LiverComponent from '@/components/liver-component'
import { CombinedLabsSection } from './Lab-Services'
import PancreasComponent from './pancreas-component'
import Cardiology from './cardiology'
import Kidney from './kidney'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { getAuth } from 'firebase/auth'
import { defaultExtractedLabData } from '@/sameple-text-json'

// Define types for weight trend data
interface WeightTrendData {
  name: string
  value: number
  change: number
}

// Function to generate weight trend data
const generateWeightTrendData = (): WeightTrendData[] => {
  return [
    { name: 'Week 1', value: 5, change: +5 },
    { name: 'Week 3', value: -8, change: -10 },
    { name: 'Week 4', value: 7, change: +5 },
    { name: 'Week 5', value: 3, change: -2 },
  ]
}

// Custom tooltip component for the weight trend chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    const change =
      payload[0].payload.change > 0
        ? `+${payload[0].payload.change}`
        : payload[0].payload.change
    return (
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <p className="text-xs font-medium text-blue-500">{`${label}: ${change} kg`}</p>
      </div>
    )
  }
  return null
}

// Define animation variants for organ images
const mainOrganVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

const switcherVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
}

const switcherItemVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

export default function DashboardMobile() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrgan, setSelectedOrgan] = useState('heart')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [extractedLabData, setExtractedLabData] = useState<any>(
    defaultExtractedLabData,
  )
  const weightTrendData = generateWeightTrendData()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false)

  useEffect(() => {
    if (activeTab === 'upload') {
      setIsFoodModalOpen(true)
    } else {
      setIsFoodModalOpen(false)
    }
  }, [activeTab])
  const router = useRouter()

  // Restore selected organ from localStorage on component mount
  useEffect(() => {
    const savedOrgan = localStorage.getItem('selectedOrgan')
    if (savedOrgan) {
      setSelectedOrgan(savedOrgan)
    }
  }, [])

  // Save selected organ to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedOrgan', selectedOrgan)
  }, [selectedOrgan])

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await logout()
      setDrawerOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Handle navigation to health records (upload page)
  const handleHealthRecords = () => {
    setActiveTab('progress')
    setDrawerOpen(false)
  }

  // Get user initials for avatar fallback
  const getUserInitials = (fullName: string | null, email: string | null) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Bottom navigation icons and handlers
  const bottomNavItems = [
    {
      id: 'overview',
      icon: <img src="/twin.svg" alt="Digital Twin Icon" className="h-6 w-6" />,
      label: 'Twin',
    },
    {
      id: 'courses',
      icon: <img src="/courses.svg" alt="Courses Icon" className="h-6 w-6" />,
      label: 'Courses',
    },
    {
      id: 'labs',
      icon: <img src="/book.svg" alt="Courses Icon" className="h-6 w-6" />,
      label: 'Directories',
    },
    {
      id: 'upload',
      icon: (
        <img
          src="/tracker-upload.svg"
          alt="Tracker Icons"
          className="h-6 w-6"
        />
      ),
      label: 'Tracker',
    },
  ]
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const fetchUserData = async () => {
      const auth = getAuth()
      const user = auth.currentUser

      try {
        const userRef = doc(db, 'users', user && user.uid ? user.uid : '')
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          // setIsAdmin(userData.role === "admin");

          // 👇 Assuming lab data is stored under `labData` in Firestore
          if (userData.extractedLabData) {
            setExtractedLabData(userData.extractedLabData)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [activeTab, selectedOrgan])
  return (
    <div className="min-h-screen bg-gray-200">
      {/* Minimal header */}
      <header className="flex justify-center z-20 w-auto px-5 py-4 bg-transparent">
        <div
          className="flex items-center"
          onClick={() => (window.location.href = '/dashboard')}
        >
          <img src="/logo.svg" alt="Logo" className="h-20 w-auto" />
        </div>
        {/* <div className="flex items-center space-x-3">
          <ProfileDropdown />
        </div> */}
      </header>

      <main className="w-full h-full pt-3 xs-padding">
        {activeTab === 'overview' ? (
          <div className="bg-gradient-to-b from-gray-100 to-white min-h-screen rounded-t-full">
            {/* Digital Twin Section */}
            <div>
              {/* Dynamic organ visualization based on selected organ */}
              <div className="items-center justify-center">
                <div className="justify-center">
                  <MobileAnatomy
                    selectedOrgan={selectedOrgan}
                    onOrganSelect={setSelectedOrgan}
                  />
                </div>
              </div>

              {/* Horizontal Organ Switcher */}
              <motion.div
                className="cursor-pointer p-14 bg-white/10 backdrop-blur-sm border border-white/20 w-full px-2 -mt-10 rounded-t-full"
                variants={switcherVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex gap-4 overflow-x-auto py-2 pb-4 px-2 scrollbar-none">
                  {[
                    {
                      id: 'heart',
                      image: '/onlyheart_light.svg',
                      alt: 'Heart',
                    },
                    {
                      id: 'lungs',
                      image: '/onlylungs_light.svg',
                      alt: 'Lungs',
                    },
                    {
                      id: 'liver',
                      image: '/onlyliver_light.svg',
                      alt: 'Liver',
                    },
                    {
                      id: 'brain',
                      image: '/onlybrain_light.svg',
                      alt: 'Brain',
                    },
                    {
                      id: 'kidney',
                      image: '/onlykidneys_light.svg',
                      alt: 'Kidneys',
                    },
                    {
                      id: 'reproductive',
                      image: '/onlymr_light.svg',
                      alt: 'Reproductive',
                    },
                  ].map((organ) => (
                    <motion.div
                      key={organ.id}
                      className={`flex flex-col items-center organ-item ${
                        selectedOrgan === organ.id
                          ? 'opacity-100'
                          : 'opacity-70'
                      }`}
                      onClick={() => setSelectedOrgan(organ.id)}
                      variants={switcherItemVariants}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          selectedOrgan === organ.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={organ.image}
                          alt={organ.alt}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <span
                        className={`text-xs font-medium mt-1 ${
                          selectedOrgan === organ.id
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        } ${selectedOrgan === organ.id ? 'tab-active' : ''}`}
                      >
                        {organ.alt}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Organ Content - Scrollable */}
              <div className="mt-1 pb-24 bg-white-50">
                {selectedOrgan === 'heart' ? (
                  <div className="px-2">
                    <HeartComponent extractedLabData={extractedLabData} />
                  </div>
                ) : selectedOrgan === 'lungs' ? (
                  <div className="">
                    <Cardiology extractedLabData={extractedLabData} />
                  </div>
                ) : selectedOrgan === 'liver' ? (
                  <div className="px-2">
                    <LiverComponent extractedLabData={extractedLabData} />
                  </div>
                ) : selectedOrgan === 'brain' ? (
                  <Neurology extractedLabData={extractedLabData} />
                ) : selectedOrgan === 'kidney' ? (
                  <Kidney extractedLabData={extractedLabData} />
                ) : selectedOrgan === 'reproductive' ? (
                  <ReproductiveHealth extractedLabData={extractedLabData} />
                ) : null}
              </div>
            </div>
          </div>
        ) : activeTab === 'labs' ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            <CombinedLabsSection extractedLabData={extractedLabData} />
          </div>
        ) : activeTab === 'courses' ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            <Course />
          </div>
        ) : activeTab === 'upload' ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            Error Opening Modal
          </div>
        ) : activeTab === 'progress' ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            <UploadPage />
          </div>
        ) : null}
      </main>

      {/* Bottom Navigation Bar - Floating pill-shaped dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-6">
        <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-full  py-3 px-2 bottom-nav-shadow safe-area-bottom mx-auto flex justify-around items-center max-w-md">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center px-3 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div
                className={`p-1 ${
                  activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-medium mt-0.5 ${
                  activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-600 -mb-1.5"></div>
              )}
            </button>
          ))}

          <button
            className="flex flex-col items-center justify-center px-3 text-gray-500"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="p-1 text-gray-400">
              <img
                src="/profile-circle.svg"
                alt="Profile Icon"
                className="h-6 w-6"
              />
            </div>
            <span className="text-xs font-medium mt-0.5 text-gray-500">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Profile Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-xl fixed bottom-0 left-0 right-0 max-h-[85vh] z-50">
            <Drawer.Title className="sr-only">User Profile</Drawer.Title>
            <div className="p-4 bg-white rounded-t-xl safe-area-bottom">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-5 drawer-pull" />

              <div className="flex items-center px-4">
                <Avatar className="h-14 w-14 border-2 border-gray-200">
                  <AvatarImage
                    src={user?.avatar || '/placeholder.svg'}
                    alt="User"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getUserInitials(user?.fullName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h2 className="font-semibold text-xl">
                    {user?.fullName || 'User'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {user?.email || 'No email provided'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto rounded-full p-2"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="mt-6 px-4 space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                >
                  <User className="mr-3 h-5 w-5" />
                  My Account
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                  onClick={handleHealthRecords}
                >
                  <Activity className="mr-3 h-5 w-5" />
                  Health Records
                </Button>

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <FoodIntakeModal
        isOpen={isFoodModalOpen}
        onClose={() => {
          setIsFoodModalOpen(false)
          setActiveTab('overview')
        }}
      />
    </div>
  )
}
