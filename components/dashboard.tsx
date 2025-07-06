'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Plus,
  MoveUpRight,
  ChevronRight,
  ArrowRight,
  UploadCloud,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import Course from '@/components/courseManage'
import { ProfileDropdown } from '@/components/ui/profile-dropdown'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

import HeartComponent from '@/components/heart-component'
import LiverComponent from '@/components/liver-component'
import PancreasComponent from '@/components/pancreas-component'
import Upload from '@/components/upload'
import EnhancedAnatomy from '@/components/enhanced-anatomy'
import ReproductiveHealth from '@/components/reproductive-health'
import FoodIntakeModal from '@/components/FoodIntakeModal'

import { PatientSection } from './PatientSection'
import Neurology from '@/components/neurology'
import { CombinedLabsSection } from './Lab-Services'
import Link from 'next/link'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import Cardiology from './cardiology'
import Kidney from './kidney'
import { defaultExtractedLabData } from '@/sameple-text-json'

// Other organ components will be imported here as they are created

// Define types for weight trend data
interface WeightTrendData {
  name: string
  value: number
  change: number
}

// Function to generate weight trend data
const generateWeightTrendData = (): WeightTrendData[] => {
  // Sample data points for the weight trend
  return [
    { name: 'Week 1', value: 5, change: +5 }, // Week 1, starting point
    { name: 'Week 3', value: -8, change: -10 }, // Week 3, dip
    { name: 'Week 4', value: 7, change: +5 }, // Week 4, peak
    { name: 'Week 5', value: 3, change: -2 }, // Week 5, end point
  ]
}

// Function to generate SVG path from data points
const generatePath = (data: WeightTrendData[]): string => {
  // Map data to coordinates
  const points = data.map((point: WeightTrendData, index: number) => {
    // Calculate x position based on index
    const x = index * (270 / (data.length - 1))
    // Calculate y position (invert the value since SVG y-axis is inverted)
    const y = point.value
    return { x, y }
  })

  // Generate the SVG path string
  let pathD = `M${points[0].x},${points[0].y}`

  // Create a smooth curve through the points
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i].x
    const y1 = points[i].y
    const x2 = points[i + 1].x
    const y2 = points[i + 1].y

    // Control points for the curve
    const cpx1 = x1 + (x2 - x1) / 3
    const cpy1 = y1
    const cpx2 = x2 - (x2 - x1) / 3
    const cpy2 = y2

    pathD += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`
  }

  return pathD
}

// Function to create tooltip content
const createTooltipContent = (point: WeightTrendData): string => {
  const change = point.change > 0 ? `+${point.change}` : point.change
  return `${point.name}: ${change} kg`
}

// Function to calculate BMI indicator position
const calculateBmiPosition = (bmi: number): number => {
  // BMI ranges
  // Underweight: < 18.5
  // Normal: 18.5 - 24.9
  // Overweight: 25 - 29.9
  // Obese: >= 30

  if (bmi < 18.5) {
    // Position in the underweight range (0-25%)
    return (bmi / 18.5) * 25
  } else if (bmi < 25) {
    // Position in the normal range (25-50%)
    return 25 + ((bmi - 18.5) / 6.5) * 25
  } else if (bmi < 30) {
    // Position in the overweight range (50-75%)
    return 50 + ((bmi - 25) / 5) * 25
  } else {
    // Position in the obese range (75-100%)
    // Cap at 100%
    return Math.min(75 + ((bmi - 30) / 10) * 25, 100)
  }
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
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

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [animationComplete, setAnimationComplete] = useState(false)
  const [selectedOrgan, setSelectedOrgan] = useState('heart')
  const weightTrendData = generateWeightTrendData()
  const [files, setFiles] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Add loading state
  const [extractedText, setExtractedText] = useState('') // Optional: show result
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false)
  const [extractedLabData, setExtractedLabData] = useState<any>(
    defaultExtractedLabData,
  )
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleUploadClick = () => {
  //   fileInputRef.current?.click();
  // };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true) // Start loading
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        console.error('Failed to extract text')
        return
      }

      const data = await res.json()
      setExtractedText(data.extractedText)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false) // End loading
    }
  }

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (
      tabParam &&
      [
        'overview',
        'progress',
        'courses',
        'labs',
        'services',
        'admin',
        'upload',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchRole = async () => {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        // User not logged in
        setIsAdmin(false)
        return
      }

      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists() && userSnap.data().role === 'admin') {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Error fetching role:', error)
      }
    }

    fetchRole()
  }, [])
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

  // Trigger animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const fetchUserData = async () => {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const userRef = doc(db, 'users', user.uid)
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

  // CSS for organ switcher circles
  const organSwitcherStyle = `
    .organ-switcher-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      border-bottom: 4px solid #E5E7EB;
      justify-content: center;
      // box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .organ-switcher-circle:hover {
      border-bottom: 2px solid #3b82f6;
      transition: border 0.1s ease-in-out;
    }

    // .organ-switcher-circle.active {
    //   border-bottom: 1px solid #3b82f6;
    //   transform: translateY(-5px);
    // }
    
    .organ-switcher-container {
      position: relative;
      z-index: 10;
      margin-top: -30px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }

    .organ-component-wrapper {
      max-height: calc(100vh - 140px);
      overflow-y: auto;
    }

    .organ-component-wrapper .bg-white {
      margin-bottom: 1rem;
    }

    .organ-component-wrapper .p-8 {
      padding: 1rem !important;
    }

    .organ-component-wrapper .p-6 {
      padding: 0.75rem !important;
    }

    .organ-component-wrapper .mb-6 {
      margin-bottom: 0.75rem !important;
    }

    .organ-component-wrapper .mb-4 {
      margin-bottom: 0.5rem !important;
    }

    .organ-component-wrapper .gap-10 {
      gap: 0.75rem !important;
    }

    .organ-component-wrapper .gap-6 {
      gap: 0.5rem !important;
    }
  `

  // Function to handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL without causing a page refresh
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.push(url.pathname + url.search)
  }

  return (
    <div className="h-screen bg-gray-200">
      <style jsx>{organSwitcherStyle}</style>
      <style jsx global>{`
        body {
          overflow: ${activeTab === 'overview' ? 'hidden' : 'auto'};
        }
      `}</style>
      <div className="h-full flex flex-col">
        <main className="w-full flex-1 flex flex-col">
          {/* Digital Twin Navigation - Moved outside conditionals so it stays in same position */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex justify-center items-center w-full mb-2 relative">
              {/* Logo on the left */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
              </div>

              <div className="flex bg-gray-100 rounded-full p-1 overflow-hidden">
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === 'overview'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700'
                  } text-sm`}
                  onClick={() => setActiveTab('overview')}
                >
                  Digital Twin
                </Button>
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === 'courses'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700'
                  } text-sm`}
                  onClick={() => setActiveTab('courses')}
                >
                  Courses
                </Button>

                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === 'labs'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700'
                  } text-sm`}
                  onClick={() => setActiveTab('labs')}
                >
                  Directories
                </Button>
              </div>

              {/* Calorie Tracker Button */}
              <Button
                variant="ghost"
                className="rounded-full px-6 py-5 border border-4 bg-gray-100  border-blue-500 text-gray-700 ml-3 font-medium"
                onClick={() => setIsFoodModalOpen(true)}
              >
                Tracker
              </Button>

              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className={`rounded-xl px-8 py-2 bg-blue-500 text-white hover:bg-blue-600 absolute left-52 bottom-1 font-medium`}
                  >
                    Admin
                  </Button>
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <ProfileDropdown />
              </div>
            </div>
          </div>

          {activeTab === 'overview' ? (
            <div className="digital-twin flex-1 px-6 bg-gradient-to-b from-gray-200 to-white overflow-hidden">
              {/* Main Content */}
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column - Enhanced anatomy with organ switcher */}
                <div className="lg:col-span-4 flex items-center justify-center">
                  <div className="w-full flex justify-center">
                    <EnhancedAnatomy
                      selectedOrgan={selectedOrgan}
                      onOrganSelect={setSelectedOrgan}
                    />
                  </div>
                </div>

                {/* Right column - Dynamic content based on selected organ */}
                <div className="lg:col-span-8 flex flex-col overflow-hidden md:mt-6 2xl:mt-20">
                  {selectedOrgan === 'heart' && (
                    <div className="h-full overflow-y-auto pr-2 organ-component-wrapper">
                      <HeartComponent
                        extractedLabData={extractedLabData || {}}
                      />
                    </div>
                  )}
                  {selectedOrgan === 'lungs' && (
                    <div className="h-full overflow-y-auto pr-2 organ-component-wrapper">
                      <Cardiology extractedLabData={extractedLabData || {}} />
                    </div>
                  )}
                  {selectedOrgan === 'liver' && (
                    <div className="h-full overflow-y-auto pr-2 organ-component-wrapper">
                      <LiverComponent
                        extractedLabData={extractedLabData || {}}
                      />
                    </div>
                  )}
                  {selectedOrgan === 'brain' && (
                    <div className="h-full overflow-y-hidden pr-2 organ-component-wrapper">
                      <Neurology extractedLabData={extractedLabData || {}} />
                    </div>
                  )}
                  {selectedOrgan === 'kidney' && (
                    <div className="h-full overflow-y-hidden pr-2 organ-component-wrapper">
                      <Kidney extractedLabData={extractedLabData || {}} />
                    </div>
                  )}
                  {selectedOrgan === 'reproductive' && (
                    <div className="h-full overflow-y-auto pr-2 -mt-8 organ-component-wrapper">
                      <ReproductiveHealth
                        extractedLabData={extractedLabData || {}}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'courses' ? (
            <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
              <Course />
            </div>
          ) : activeTab === 'labs' ? (
            // <LabsSection />
            <CombinedLabsSection extractedLabData={extractedLabData || {}} />
          ) : activeTab === 'upload' ? (
            <Upload />
          ) : activeTab === 'progress' ? (
            <div className="px-6 bg-gradient-to-b from-gray-200 to-white min-h-screen">
              {/* <div className="p-8 bg-white rounded-3xl shadow-sm mt-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Overall Progress
                </h2>
                <p className="text-gray-600">
                  Track your health metrics and overall progress here.
                </p>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Health Score</h3>
                  <Progress value={75} className="h-2 w-full" />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">0</span>
                    <span className="text-sm text-gray-500">100</span>
                  </div>
                </div>
              </div> */}
              {/* <WeightTrackingComponent /> */}
            </div>
          ) : activeTab === 'admin' ? (
            <PatientSection />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gradient-to-b from-gray-200 to-white min-h-screen">
              <p className="text-gray-500">This section is under development</p>
            </div>
          )}
        </main>
      </div>

      {/* Food Intake Modal */}
      <FoodIntakeModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
      />
    </div>
  )
}
