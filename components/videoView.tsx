'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Circle,
  CheckCircle,
  Clock,
  ArrowLeft,
  ThumbsUp,
  FileText,
  Eye,
  Download,
  Trash2,
} from 'lucide-react'
import { YouTubePlayer } from './ytPlayer'
import { FileUpload } from './ui/file-upload'
import {
  db,
  giveLoggedInUser,
  uploadUserDocument,
  deleteUserFile,
} from '@/utils/firebase'
import { ClipboardList } from 'lucide-react'
import { getStorage, ref, deleteObject } from 'firebase/storage'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore'

import { toast } from 'react-toastify'

interface VideoPlayerViewProps {
  programId: string
  moduleId: string
  videoId: string
  programData: any // 🟡 Real dynamic data
  onBack: () => void
  completedVideos: any
  onMarkComplete: (videoId: string, moduleId: string) => void
  moduleProgress: Record<string, number>
  moduleTitle: any
  videoTitle: any
}

export function VideoPlayerView({
  programId,
  moduleId,
  videoId,
  programData,
  onBack,
  completedVideos,
  moduleTitle,
  videoTitle,
  onMarkComplete,
  moduleProgress,
}: VideoPlayerViewProps) {
  const [currentVideoId, setCurrentVideoId] = useState(videoId)
  const [videoProgress, setVideoProgress] = useState(0)
  const [todoChecks, setTodoChecks] = useState<Record<number, boolean>>({})
  const [comments, setComments] = useState<any[]>([])

  // console.log( "programId",  programId , "moduleId" , moduleId, "videoId" , videoId, "video-title" ,videoTitle  ,"module-title", moduleTitle)
  // Update current video when videoId changes
  const moduleData = programData.modules[moduleId]

  const moduleVideos: any = Object.values(moduleData?.videos || {})
  const currentVideo: any =
    moduleVideos.find((v: any) => v.id === currentVideoId) || moduleVideos[0]
  const currentYoutubeId = currentVideo.youtubeId
  const currentLessonNumber =
    moduleVideos.findIndex((v: any) => v.id === currentVideoId) + 1

  const handleVideoSelect = (id: string) => {
    setCurrentVideoId(id)
  }

  const handleVideoComplete = () => {
    onMarkComplete(currentVideoId, moduleId)
  }

  const handleMarkComplete = () => {
    onMarkComplete(currentVideoId, moduleId)
  }

  const handleVideoProgressUpdate = (progress: number) => {
    setVideoProgress(progress)

    if (progress > 95 && !completedVideos[currentVideoId]) {
      handleVideoComplete()
    }
  }

  const validTodos =
    currentVideo?.todo?.filter((t: string) => t.trim() !== '') || []

  const getFileName = (url: string) => {
    try {
      const decodedPath = decodeURIComponent(
        url.split('/o/')[1]?.split('?')[0] || '',
      )
      return decodedPath.split('/').pop() || 'Document'
    } catch {
      return 'Document'
    }
  }

  useEffect(() => {
    setCurrentVideoId(videoId)
  }, [videoId])
  useEffect(() => {
    if (!currentVideoId) return
    setTodoChecks({})

    const fetchTodoChecks = async () => {
      const user = await giveLoggedInUser()
      if (!user) return

      const userRef = doc(getFirestore(), 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.exists() ? userSnap.data() : {}
      const allTodos = userData.todoChecks || []

      const checks: Record<number, boolean> = {}

      validTodos.forEach((todoText: any, idx: any) => {
        const existingIndex = allTodos.findIndex(
          (t: any) =>
            t.todoText === todoText &&
            t.checkedVideo === currentVideoId && // ✅ not videoId
            t.moduleId === moduleId,
        )

        if (existingIndex !== -1 && allTodos[existingIndex].isChecked) {
          checks[idx] = true
        }
      })

      setTodoChecks(checks)
    }

    fetchTodoChecks()
  }, [currentVideoId, moduleId])

  const handleToggleTodo = async (index: number) => {
    // const todoText = validTodos[index]

    const user = await giveLoggedInUser()
    if (!user) return

    const todoText = validTodos[index]
    if (!todoText) return // Prevent invalid entry
    const userRef = doc(getFirestore(), 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const currentData = userSnap.exists()
      ? userSnap.data().todoChecks || []
      : []

    const newTodos = [...currentData]
    const existingIndex = newTodos.findIndex(
      (t: any) =>
        t.todoText === todoText &&
        t.checkedVideo === videoId &&
        t.moduleId === moduleId,
    )

    if (existingIndex >= 0) {
      newTodos[existingIndex].isChecked = !newTodos[existingIndex].isChecked
    } else {
      newTodos.push({
        index,
        todoText,
        isChecked: true,
        checkedVideo: currentVideoId, // ✅
        moduleId,
      })
    }

    await setDoc(userRef, { todoChecks: newTodos }, { merge: true })

    setTodoChecks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Get module and video data from programData

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-6 md:-ml-6 flex items-center">
        <Button
          variant="ghost"
          className="mr-4 py-5 px-3 rounded-full hover:bg-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {moduleData.title}
          </h1>
          <div className="text-sm text-gray-500">
            Stage {currentLessonNumber} • {currentVideo?.title || ''}
          </div>
        </div>
        <div className="ml-auto px-8">
          <Button
            onClick={handleMarkComplete}
            disabled={
              !!completedVideos?.[programId]?.[moduleId]?.includes(
                currentVideoId,
              )
            }
            className={`rounded-full px-4 py-2 text-sm ${
              !!completedVideos?.[programId]?.[moduleId]?.includes(
                currentVideoId,
              )
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {!!completedVideos?.[programId]?.[moduleId]?.includes(
              currentVideoId,
            )
              ? 'Completed'
              : 'Mark Complete'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 py-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Module navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900">
                  Stage {getStageNumber(moduleId)}
                </h3>
                <p className="text-sm text-gray-500">{moduleData.title}</p>
              </div>

              <div className="divide-y">
                {moduleVideos.map((video: any) => (
                  <div
                    key={video.id}
                    className={`flex items-center p-4 cursor-pointer ${
                      currentVideoId === video.id
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleVideoSelect(video.id)}
                  >
                    <div className="flex items-center gap-3">
                      {!!completedVideos?.[programId]?.[moduleId]?.includes(
                        video.id,
                      ) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {video.title}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content - Video player */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video w-full bg-black">
                <YouTubePlayer
                  videoId={currentYoutubeId}
                  onComplete={handleVideoComplete}
                  onProgressUpdate={handleVideoProgressUpdate}
                />
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Module Progress: {moduleProgress[moduleId] || 0}%
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  About This Lesson
                </h3>
                <p className="text-gray-700 mb-6">
                  In this lesson, you will learn about{' '}
                  {currentVideo.title.toLowerCase()}. This is an important
                  concept that will help you understand the overall framework
                  and approach to health optimization.
                </p>
              </div>
            </div>

            {/* Comments section */}
            {/* <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comments
                </h3>
                <span className="text-sm text-gray-500">12 comments</span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    A
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">Andrew</span>
                      <span className="text-xs text-gray-500">2d ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Hey guys, I'm having trouble understanding how to
                      implement this in my daily routine. Any tips?
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp className="h-3 w-3" />
                        <span>7</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ... more comments */}
            {/* </div> */}
            {/* </div> */}
            <div className="mt-10 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Lesson Checklist
              </h2>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Video: {currentVideo.title}
                </h3>
                {validTodos.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {validTodos.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 py-3 group hover:bg-gray-50 px-2 rounded-md transition cursor-pointer"
                        onClick={() => handleToggleTodo(idx)}
                      >
                        {todoChecks[idx] ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-gray-800 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <ClipboardList className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="text-sm font-medium">
                      No to-do items are available for this lesson.
                    </p>
                  </div>
                )}
              </div>
              {currentVideo.documentUrl && (
                <div className="mt-6 p-6 bg-white border rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-gray-900 font-medium text-sm">
                        {getFileName(currentVideo.documentUrl)}
                      </p>

                      <p className="text-gray-500 text-xs">
                        Click to view or download
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(currentVideo.documentUrl, '_blank')
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <a
                      href={currentVideo.documentUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get stage number from module ID
function getStageNumber(moduleId: string): number {
  const stageMap: Record<string, number> = {
    'mission-control': 1,
    'rapid-success': 2,
    'may-religion': 3,
    'june-meaning': 4,
    'june-alignment': 5,
    'july-bioenergetics': 6,
    'august-medicine': 7,
  }
  return stageMap[moduleId] || 1
}
