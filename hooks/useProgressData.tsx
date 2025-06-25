'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { get, ref } from 'firebase/database'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db, rtdb } from '@/utils/firebase'
import { getAuth } from 'firebase/auth'

interface ProgramContextType {
  programData: any
  userCompletedVideos: Record<string, Record<string, string[]>>
  loading: boolean
  allProgrammes: any[]
  setAllProgrammes: (programs: any[]) => void
  stats: {
    programs: number
    modules: number
    videos: number
    users: number
  }
  recentActivity: any
  setrecentActivity: any
}

const ProgramContext = createContext<ProgramContextType>({
  programData: null,
  userCompletedVideos: {},
  loading: true,
  allProgrammes: [],
  setAllProgrammes: () => {},
  stats: { programs: 0, modules: 0, videos: 0, users: 0 },
  recentActivity: [],
  setrecentActivity: () => {},
})

export const ProgramProvider = ({
  children,
  programId,
  activeView,
  setActiveView,
}: {
  children: React.ReactNode
  programId?: string
  activeView?: string
  setActiveView?: any
}) => {
  const [programData, setProgramData] = useState<any>(null)
  const [allProgrammes, setAllProgrammes] = useState<any[]>([])
  const [recentActivity, setrecentActivity] = useState<any[]>([])
  const [userCompletedVideos, setUserCompletedVideos] = useState<
    Record<string, Record<string, string[]>>
  >({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    programs: 0,
    modules: 0,
    videos: 0,
    users: 0, // ← NEW
  })

  const fetchUserCount = async () => {
    const usersSnap = await getDocs(collection(db, 'users'))
    return usersSnap.size // number of user documents
  }

  useEffect(() => {
    const fetchSingleProgram = async () => {
      try {
        const programRef = ref(rtdb, `courses/thrivemed/programs/${programId}`)
        const snapshot = await get(programRef)
        if (snapshot.exists()) {
          const data = snapshot.val()
          setProgramData(data)
        } else {
        }
      } catch (error) {
        console.error('Error fetching program data:', error)
      }
    }

    if (programId) {
      fetchSingleProgram()
    }
  }, [programId])

  useEffect(() => {
    const fetchAllPrograms = async () => {
      try {
        const programsRef = ref(rtdb, `courses/thrivemed/programs`)
        const snapshot = await get(programsRef)
        if (snapshot.exists()) {
          const data = snapshot.val()

          const programsArray = Object.entries(data).map(
            ([key, value]: any) => ({
              id: key,
              ...value,
            }),
          )

          setAllProgrammes(programsArray)

          // Count modules and videos
          let totalModules = 0
          let totalVideos = 0

          programsArray.forEach((program: any) => {
            const modules = program.modules
              ? Object.values(program.modules)
              : []
            totalModules += modules.length

            modules.forEach((module: any) => {
              const videos = module.videos ? Object.values(module.videos) : []
              totalVideos += videos.length // ✅ correct way
            })
          })
          const totalUsers = await fetchUserCount()
          setStats({
            programs: programsArray.length,
            modules: totalModules,
            videos: totalVideos,
            users: totalUsers,
          })
        } else {
          // console.log("No programs data found.");
        }
      } catch (error) {
        console.error('Error fetching all programs:', error)
      }
    }
    fetchAllPrograms()
  }, [activeView])

  useEffect(() => {
    const fetchUserCompletion = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserCompletedVideos(data.completedVideos || {})
          setrecentActivity(data.recentActivity || [])
        } else {
          // console.log("No user data found for user:", user.uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    fetchUserCompletion()
  }, [])

  // Unified loading logic
  useEffect(() => {
    if (programData !== null && allProgrammes.length !== 0) {
      setLoading(false)
    }
  }, [programData, allProgrammes])

  return (
    <ProgramContext.Provider
      value={{
        programData,
        userCompletedVideos,
        loading,
        allProgrammes,
        setAllProgrammes,
        stats,
        recentActivity,
        setrecentActivity,
      }}
    >
      {children}
    </ProgramContext.Provider>
  )
}

export const useProgramContext = () => useContext(ProgramContext)
