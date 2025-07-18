'use client'
// import React from "React"
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { ChevronDown, CheckCircle, Circle, ArrowLeft } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { get, ref } from 'firebase/database'
import { db, rtdb } from '@/utils/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { ProgramProvider, useProgramContext } from '@/hooks/useProgressData'

interface ModuleOverviewProps {
  programId: string
  onModuleSelect: (
    moduleId: string,
    videoId: string,
    moduleTitle: string,
    videoTitle: string,
  ) => void
  onBack: () => void
  completedVideos: Record<string, Record<string, string[]>>
  moduleProgress: Record<string, number>
}

export function ModuleOverview({
  programId,
  onModuleSelect,
  onBack,
  completedVideos,
  moduleProgress,
}: ModuleOverviewProps) {
  // console.log("moduleee progress",moduleProgress )
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    'mission-control': true,
    'rapid-success': false,
    'may-religion': false,
    'june-meaning': false,
    'june-alignment': false,
    'july-bioenergetics': false,
    'august-medicine': false,
  })
  const [userCompletedVideos, setUserCompletedVideos] = useState<
    Record<string, Record<string, string[]>>
  >({})
  const [programData, setprogramData] = useState<any>({})
  // const { programData, userCompletedVideos, loading } = useProgramContext();

  // console.log("programIdonModuleSelect onBackcompletedVideosmoduleProgress")
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  useEffect(() => {
    const fetchPrograms = async () => {
      const programsRef = ref(rtdb, `courses/thrivemed/programs/${programId}`)
      const snapshot = await get(programsRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        setprogramData(data)
      }
    }

    fetchPrograms()
  }, [])

  useEffect(() => {
    const fetchUserCompletion = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const data = userSnap.data()
        setUserCompletedVideos(data.completedVideos || {})
      }
    }

    fetchUserCompletion()
  }, [])

  const calculateOverallProgress = () => {
    const modules = Object.values(programData.modules ?? {})
    if (modules.length === 0) return 0

    let totalProgress = 0
    let moduleCount = 0

    modules.forEach((module: any) => {
      const videoIds = Object.keys(module.videos ?? {})
      const completedVideoIds =
        userCompletedVideos[programId]?.[module.id] || []

      const completedCount = completedVideoIds.length
      const totalCount = videoIds.length

      const progress =
        totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

      totalProgress += progress
      moduleCount++
    })

    return Math.round(totalProgress / moduleCount)
  }
  const sortedModules = React.useMemo(
    () =>
      Object.values(programData.modules ?? {}).sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [programData.modules],
  )

  return (
    <div className="min-h-screen -ml-3 text-black">
      {/* Header */}
      <div className="py-6 px-3 md:px-0 md:-ml-6 flex items-center">
        <Button
          variant="ghost"
          className="mr-4 py-5 px-3 rounded-full hover:bg-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-white" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {programData.name}
          </h1>
          <div className="text-sm text-gray-500">
            Registered on {programData.dateRegistered}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Left sidebar - Module navigation */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4">
              {sortedModules.map((module: any) => {
                // 🔵 sort videos inside the module the same way
                const sortedVideos = Object.values(module.videos ?? {}).sort(
                  (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
                )

                const completedVideoIds =
                  userCompletedVideos[programId]?.[module.id] || []

                const completedCount = completedVideoIds.length
                const totalCount = sortedVideos.length
                const progress =
                  totalCount === 0
                    ? 0
                    : Math.round((completedCount / totalCount) * 100)

                return (
                  <div
                    key={module.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* header -------------------------------------------------- */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection(module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <div className="absolute inset-0">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-full w-full"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#e6e6e6"
                                strokeWidth="10"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke={
                                  progress === 100 ? '#10b981' : '#3b82f6'
                                }
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${progress * 2.51} 251`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">
                            {progress}%
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {module.title}
                        </h3>
                      </div>
                    </div>
                    {/* videos -------------------------------------------------- */}
                    {expandedSections[module.id] && (
                      <div>
                        {sortedVideos.map((video: any) => (
                          <div
                            key={video.id}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              onModuleSelect(
                                module.id,
                                video.id,
                                module.title,
                                video.title,
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              {completedVideoIds.includes(video.id) ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300" />
                              )}
                              <span className="text-sm text-gray-900">
                                {video.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right content - Program details */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Description
              </h2>
              <p className="text-gray-700 mb-6">{programData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Course Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lecture Type</span>
                      <span className="font-medium text-gray-900">
                        Pre-recorded
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skills Level</span>
                      <span className="font-medium text-gray-900">
                        Beginner
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modules</span>
                      <span className="font-medium text-gray-900">
                        {programData.totalModules}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Critique Session</span>
                      <span className="font-medium text-gray-900">
                        Once a Week
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">
                          Overall Completion
                        </span>
                        <span className="font-medium text-gray-900">
                          {calculateOverallProgress()}%
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Modules</span>
                        <span className="font-medium text-gray-900">
                          {Object.keys(programData.modules ?? {}).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Progress Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Modules
                </h2>
                {/* <div className="text-sm text-gray-500">
              {Object.values(programData.modules).reduce(
                (total: any, module: any) =>
                  total + (module.videos ? Object.keys(module.videos).length : 0),
                0
              )}{" "}
              lessons
            </div> */}
              </div>

              <div className="space-y-4">
                {sortedModules.map((module: any) => {
                  // (optional) sort videos if you ever need them in order later
                  const sortedVideos = Object.values(module.videos ?? {}).sort(
                    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
                  )

                  const completedVideoIds =
                    userCompletedVideos[programId]?.[module.id] || []

                  const completedCount = completedVideoIds.length
                  const totalCount = sortedVideos.length // ← use the sorted list
                  const progress =
                    totalCount === 0
                      ? 0
                      : Math.round((completedCount / totalCount) * 100)

                  return (
                    <div
                      key={module.id}
                      className="rounded-xl overflow-hidden shadow-sm"
                    >
                      <div className="bg-gray-50 p-4 flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">
                          {module.title}
                        </h3>

                        <div className="text-sm text-gray-500">
                          {totalCount} lessons • {progress}% complete
                        </div>
                      </div>
                      <div className="p-2">
                        <Progress value={progress} className="h-1" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
