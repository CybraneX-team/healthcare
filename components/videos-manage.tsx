'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  VideoIcon,
  Youtube,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { db, rtdb } from '@/utils/firebase'
import { ref, get, set, onValue, push, remove, update } from 'firebase/database'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useProgramContext } from '@/hooks/useProgressData'
import { FileUpload } from './ui/file-upload'
// Correct usage in your component/page:
import { ref as dbRef } from 'firebase/database'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from 'firebase/storage'

interface VideosManagerProps {
  programId: string
  moduleId: string
  onBack: () => void
  setSidebarOpen: (open: boolean) => void
}

export function VideosManager({
  programId,
  moduleId,
  onBack,
  setSidebarOpen,
}: VideosManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAdding, setisAdding] = useState(false)
  const [loadingText, setloadingText] = useState<any>('Adding Video')
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    youtubeId: '',
    duration: '00:00',
    order: 1,
    todo: [''],
    documentUrl: '',
  })
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { recentActivity, setrecentActivity } = useProgramContext()
  // const [currentModuleForVideo, setCurrentModuleForVideo] = useState<Module | null>(null);

  // Mock program and module data
  const program = {
    id: programId,
    name: programId,
  }

  const module = {
    id: moduleId,
    title: getModuleTitle(moduleId),
  }
  function extractYouTubeId(urlOrId: string): string {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = urlOrId.match(regex)
    return match ? match[1] : urlOrId
  }

  async function fetchVideoDuration(youtubeId: string, calledFor: string) {
    try {
      const response = await fetch(`/api/youtube-duration?videoId=${youtubeId}`)
      const data = await response.json()

      let formattedDuration = '00:00'

      if (data.durationSeconds) {
        const minutes = Math.floor(data.durationSeconds / 60)
        const seconds = data.durationSeconds % 60
        formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      } else {
        console.error('Could not fetch duration:', data.error)
      }

      if (calledFor === 'newVideo') {
        setNewVideo((prev) => ({ ...prev, duration: formattedDuration }))
      } else {
        setSelectedVideo((prev: any) => ({
          ...prev,
          duration: formattedDuration,
        }))
      }
    } catch (error) {
      console.error('Error fetching video duration:', error)
      const fallbackDuration = '00:00'
      if (calledFor === 'newVideo') {
        setNewVideo((prev) => ({ ...prev, duration: fallbackDuration }))
      } else {
        setSelectedVideo((prev: any) => ({
          ...prev,
          duration: fallbackDuration,
        }))
      }
    }
  }

  function convertISO8601ToMinutes(durationISO: string): string {
    const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/
    const matches = durationISO.match(regex)
    const minutes = parseInt(matches?.[1] || '0', 10)
    const seconds = parseInt(matches?.[2] || '0', 10)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function getModuleTitle(moduleId: string): string {
    const moduleTitles: Record<string, string> = {
      'mission-control': 'Mission Control',
      'rapid-success': 'Rapid Success Path',
      'may-religion': 'May - Religion, Spirituality, Death and Longevity',
      'june-meaning': 'June - Meaning',
      'june-alignment': 'June - Alignment',
    }
    return moduleTitles[moduleId] || 'Module'
  }
  interface Video {
    id: string
    title: string
    description: string
    // url: string;
    createdAt: string
    youtubeId: string
    duration: string
    completed: boolean
    order: number
  }

  // Mock data for videos
  const [videos, setVideos] = useState<any[]>([
    // {
    //   id: "welcome-video",
    //   title: "Welcome to Thrivemed Hub",
    //   description: "Introduction to the Thrivemed Hub platform and resources",
    //   youtubeId: "dQw4w9WgXcQ",
    //   duration: "05:12",
    //   completed: true,
    //   order: 1,
    // },
    // {
    //   id: "office-hours-video",
    //   title: "Open Office Hours Schedule",
    //   description:
    //     "Overview of the office hours schedule and how to participate",
    //   youtubeId: "9bZkp7q19f0",
    //   duration: "12:30",
    //   completed: true,
    //   order: 2,
    // },
    // {
    //   id: "session-recordings-video",
    //   title: "Open Session Recordings",
    //   description: "How to access and use the session recordings",
    //   youtubeId: "JGwWNGJdvx8",
    //   duration: "18:45",
    //   completed: false,
    //   order: 3,
    // },
  ])

  useEffect(() => {
    const fetchModuleVideos = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()
      const completedVideos =
        userData?.completedVideos?.[programId]?.[moduleId] || []

      const videosRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${moduleId}/videos`,
      )
      const snapshot = await get(videosRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const loadedVideos = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
          completed: completedVideos.includes(id), // ✅ Mark completed
          createdAt: new Date(value.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }))
        setVideos(loadedVideos)
      } else {
        setVideos([])
      }
    }

    if (programId && moduleId) {
      fetchModuleVideos()
    }
  }, [programId, moduleId])

  const filteredVideos = videos
    .filter(
      (video: Video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.order - b.order)

  // const handleAddVideo = () => {
  //   const id = newVideo.title.toLowerCase().replace(/\s+/g, "-") + "-video";
  //   const newVideoData = {
  //     id,
  //     ...newVideo,
  //     completed: false,
  //   };

  //   setVideos([...videos, newVideoData]);
  //   setNewVideo({
  //     title: "",
  //     description: "",
  //     youtubeId: "",
  //     duration: "00:00",
  //     order: videos.length + 1,
  //   });
  //   setIsAddDialogOpen(false);
  // };

  //   const handleAddVideo = async () => {
  //   if (!currentModuleForVideo) return;
  //   const videoId = newVideo.title.toLowerCase().replace(/\s+/g, "-");

  //   const videoData: Video = {
  //     id: videoId,
  //     title: newVideo.title,
  //     url: newVideo.url,
  //     createdAt: new Date().toISOString(),
  //   };

  //   try {
  //     const videoRef = ref(
  //       rtdb,
  //       `courses/thrivemed/programs/${programId}/modules/${currentModuleForVideo.id}/videos/${videoId}`
  //     );
  //     await set(videoRef, videoData);
  //     setIsAddVideoDialogOpen(false);
  //     setNewVideo({ title: "", url: "" });
  //     alert("Video added successfully");
  //   } catch (error) {
  //     console.error("Error adding video:", error);
  //   }
  // };

  const handleAddVideo = async () => {
    setisAdding(true)
    setIsAddDialogOpen(false)

    const id = newVideo.title.toLowerCase().replace(/\s+/g, '-')
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)

    const newItem = {
      activity: `Added  Video   ${newVideo.title}`,
      name: newVideo.title,
      createdAt: Date.now(),
    }

    setrecentActivity((prev: any) => {
      const next = [...prev, newItem]
      // fire-and-forget; no await needed here
      updateDoc(userRef, { recentActivity: next })
      return next
    })
    const nowISOString = new Date().toISOString()
    const nowFormattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const newVideoData = {
      id,
      ...newVideo,
      documentUrl: newVideo.documentUrl || '',
      progress: 0,
      modules: {},
      createdAt: nowISOString,
      updatedAt: nowISOString,
    }

    try {
      const programRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${moduleId}/videos/${id}`,
      )
      await set(programRef, newVideoData)

      setVideos((prev) => [
        ...prev,
        {
          ...newVideoData,
          createdAt: nowFormattedDate,
        },
      ])

      // Update user's completed videos
      const userSnap = await getDoc(userRef)
      const prevCompletedVideos = userSnap.data()?.completedVideos || {}
      const programVideos = prevCompletedVideos[programId] || {}
      const moduleVideosSet = new Set(programVideos[moduleId] || [])
      // moduleVideosSet.add(id);

      const updatedCompletedVideos = {
        ...prevCompletedVideos,
        [programId]: {
          ...programVideos,
          [moduleId]: Array.from(moduleVideosSet),
        },
      }

      // Fetch program modules once, and cast to proper type
      type ModuleData = { videos?: Record<string, any> }
      type ProgramModulesData = { modules?: Record<string, ModuleData> }

      const programModulesSnap = await new Promise<ProgramModulesData>(
        (resolve) => {
          onValue(
            ref(rtdb, `courses/thrivemed/programs/${programId}`),
            (snapshot) => resolve(snapshot.val() as ProgramModulesData),
            { onlyOnce: true },
          )
        },
      )

      const modules = programModulesSnap.modules || {}
      const newModuleProgress: Record<string, number> = {}
      let totalVideosCount = 0
      let totalCompletedCount = 0

      Object.entries(modules).forEach(([modId, modData]) => {
        // Cast modData to ModuleData
        const moduleData = modData as ModuleData
        const totalVideos = Object.keys(moduleData.videos || {}).length
        const completedCount =
          updatedCompletedVideos[programId]?.[modId]?.length || 0
        const progress =
          totalVideos === 0
            ? 0
            : Math.round((completedCount / totalVideos) * 100)

        newModuleProgress[modId] = progress
        totalVideosCount += totalVideos
        totalCompletedCount += completedCount
      })

      const programProgressPercent =
        totalVideosCount === 0
          ? 0
          : Math.round((totalCompletedCount / totalVideosCount) * 100)

      // Update user doc in one call
      await updateDoc(userRef, {
        [`programProgress.${programId}`]: programProgressPercent,
      })
      if (programProgressPercent === 100) {
        await updateDoc(userRef, {
          [`programStatus.${programId}`]: 'completed',
        })
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error)
    } finally {
      setNewVideo({
        title: '',
        description: '',
        youtubeId: '',
        duration: '00:00',
        order: 1,
        todo: [''],
        documentUrl: '',
      })
      setisAdding(false)
    }
  }

  const handleEditVideo = async () => {
    if (!selectedVideo) return

    setisAdding(true)
    setloadingText('Editing Video')
    setIsEditDialogOpen(false)

    const updatedVideo = {
      ...selectedVideo,
      updatedAt: new Date().toISOString(),
    }
    const auth = getAuth()

    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)

    const newItem = {
      activity: `Edited  Video   ${updatedVideo.title}`,
      name: updatedVideo.title,
      createdAt: Date.now(),
    }

    setrecentActivity((prev: any) => {
      const next = [...prev, newItem]
      // fire-and-forget; no await needed here
      updateDoc(userRef, { recentActivity: next })
      return next
    })
    try {
      const videoRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${moduleId}/videos/${selectedVideo.id}`,
      )

      await set(videoRef, updatedVideo)

      const updatedVideos = videos.map((video) =>
        video.id === selectedVideo.id ? updatedVideo : video,
      )

      setVideos(updatedVideos)
    } catch (error) {
      console.error('Failed to update video in Firebase:', error)
    } finally {
      setisAdding(false)
      setloadingText('Adding Video')
    }
  }

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return
    setisAdding(true)
    setloadingText('deleting video')

    setIsDeleteDialogOpen(false)

    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)

    const newItem = {
      activity: `Deleted  Video   ${newVideo.title}`,
      name: newVideo.title,
      createdAt: Date.now(),
    }

    setrecentActivity((prev: any) => {
      const next = [...prev, newItem]
      // fire-and-forget; no await needed here
      updateDoc(userRef, { recentActivity: next })
      return next
    })
    try {
      // 1️⃣ Remove video from RTDB
      const videoRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${moduleId}/videos/${selectedVideo.id}`,
      )
      await remove(videoRef)

      // 2️⃣ Update videos state
      setVideos((prev) => prev.filter((video) => video.id !== selectedVideo.id))

      // 3️⃣ Fetch user's completed videos
      const userSnap = await getDoc(userRef)
      const prevCompletedVideos = userSnap.data()?.completedVideos || {}

      const programVideos = prevCompletedVideos[programId] || {}
      const moduleVideosSet = new Set(programVideos[moduleId] || [])
      // Remove the deleted video ID from user's completed videos
      moduleVideosSet.delete(selectedVideo.id)

      const updatedCompletedVideos = {
        ...prevCompletedVideos,
        [programId]: {
          ...programVideos,
          [moduleId]: Array.from(moduleVideosSet),
        },
      }

      // 4️⃣ Fetch all program modules to recalculate progress
      type ModuleData = { videos?: Record<string, any> }
      type ProgramModulesData = { modules?: Record<string, ModuleData> }

      const programModulesSnap = await new Promise<ProgramModulesData>(
        (resolve) => {
          onValue(
            ref(rtdb, `courses/thrivemed/programs/${programId}`),
            (snapshot) => resolve(snapshot.val() as ProgramModulesData),
            { onlyOnce: true },
          )
        },
      )

      const modules = programModulesSnap.modules || {}
      const newModuleProgress: Record<string, number> = {}
      let totalVideosCount = 0
      let totalCompletedCount = 0

      Object.entries(modules).forEach(([modId, modData]) => {
        const moduleData = modData as ModuleData
        const totalVideos = Object.keys(moduleData.videos || {}).length
        const completedCount =
          updatedCompletedVideos[programId]?.[modId]?.length || 0
        const progress =
          totalVideos === 0
            ? 0
            : Math.round((completedCount / totalVideos) * 100)

        newModuleProgress[modId] = progress
        totalVideosCount += totalVideos
        totalCompletedCount += completedCount
      })

      const programProgressPercent =
        totalVideosCount === 0
          ? 0
          : Math.round((totalCompletedCount / totalVideosCount) * 100)

      // 5️⃣ Update user's progress in Firestore
      await updateDoc(userRef, {
        completedVideos: updatedCompletedVideos,
        [`programProgress.${programId}`]: programProgressPercent,
      })
      await updateDoc(userRef, {
        [`programStatus.${programId}`]:
          programProgressPercent === 100 ? 'completed' : 'active',
      })
    } catch (error) {
      console.error('Failed to delete video from Firebase:', error)
    } finally {
      setisAdding(false)
      setloadingText('addding video')
    }
  }
  const openEditDialog = (video: any) => {
    setSelectedVideo({ ...video })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (video: any) => {
    setSelectedVideo(video)
    setIsDeleteDialogOpen(true)
  }

  const toggleVideoCompletion = async (videoId: string) => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const prevCompletedVideos = userSnap.data()?.completedVideos || {}
    const programVideos = prevCompletedVideos[programId] || {}
    const moduleVideos = new Set(programVideos[moduleId] || [])

    const isCompleted = moduleVideos.has(videoId)

    if (isCompleted) {
      moduleVideos.delete(videoId) // Mark as Incomplete
    } else {
      moduleVideos.add(videoId) // Mark as Complete
    }

    const updatedCompletedVideos = {
      ...prevCompletedVideos,
      [programId]: {
        ...programVideos,
        [moduleId]: Array.from(moduleVideos),
      },
    }

    const programRefRTDB = ref(rtdb, `courses/thrivemed/programs/${programId}`)
    const programSnap = await new Promise<any>((resolve) => {
      onValue(programRefRTDB, (snapshot) => resolve(snapshot.val()), {
        onlyOnce: true,
      })
    })
    const modules = (programSnap.modules || {}) as Record<string, any>

    const newModuleProgress: Record<string, number> = {}
    let totalVideosCount = 0
    let totalCompletedCount = 0

    for (const [modId, modData] of Object.entries(modules)) {
      const totalVideos = Object.keys(modData.videos || {}).length
      const completedCount =
        updatedCompletedVideos[programId]?.[modId]?.length || 0
      const progress =
        totalVideos === 0 ? 0 : Math.round((completedCount / totalVideos) * 100)

      newModuleProgress[modId] = progress
      totalVideosCount += totalVideos
      totalCompletedCount += completedCount
    }

    const programProgressPercent =
      totalVideosCount === 0
        ? 0
        : Math.round((totalCompletedCount / totalVideosCount) * 100)

    await updateDoc(userRef, {
      [`completedVideos.${programId}`]: updatedCompletedVideos[programId],
      [`moduleProgress.${programId}`]: newModuleProgress,
      [`programProgress.${programId}`]: programProgressPercent,
    })

    if (programProgressPercent === 100) {
      await updateDoc(userRef, {
        [`programStatus.${programId}`]:
          programProgressPercent === 100 ? 'completed' : 'active',
      })
    }

    // Update UI
    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, completed: !isCompleted } : video,
    )
    setVideos(updatedVideos)
  }

  return (
    <>
      {isAdding && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4
                    bg-black/30 backdrop-blur-sm"
        >
          <div className="loader" />
          <span className="text-sm my-5 font-medium text-white">
            {loadingText}
          </span>
        </div>
      )}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              className="p-2 rounded-full flex-shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {module.id}: videos
              </h1>
              <p className="text-sm text-gray-500">
                Manage videos for this module
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] mx-4 my-5 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Video Title
                  </label>
                  <Input
                    id="title"
                    value={newVideo.title}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, title: e.target.value })
                    }
                    placeholder="Enter video title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newVideo.description}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, description: e.target.value })
                    }
                    placeholder="Enter video description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="youtubeId" className="text-sm font-medium">
                    YouTube Video ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="youtubeId"
                      value={newVideo.youtubeId}
                      onChange={(e) => {
                        const extractedId = extractYouTubeId(e.target.value)
                        setNewVideo({
                          ...newVideo,
                          youtubeId: extractedId,
                        })
                        fetchVideoDuration(extractedId, 'newVideo') // 🪄 auto-fetch (no iframe)
                      }}
                      placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
                    />

                    <Button variant="outline" className="flex-shrink-0">
                      <Youtube className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the YouTube video ID from the URL (e.g.,
                    youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">
                      Duration
                    </label>
                    <Input
                      id="duration"
                      value={newVideo.duration}
                      onChange={(e) =>
                        setNewVideo({ ...newVideo, duration: e.target.value })
                      }
                      placeholder="MM:SS"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="order" className="text-sm font-medium">
                      Order
                    </label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={newVideo.order}
                      onChange={(e) =>
                        setNewVideo({
                          ...newVideo,
                          order: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">
                    To-Do List (optional)
                  </label>
                  {newVideo.todo.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        className="flex-1"
                        value={item}
                        onChange={(e) => {
                          const updatedTodos = [...newVideo.todo]
                          updatedTodos[index] = e.target.value
                          setNewVideo({ ...newVideo, todo: updatedTodos })
                        }}
                        placeholder={`To-do item #${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const updatedTodos = newVideo.todo.filter(
                            (_, i) => i !== index,
                          )
                          setNewVideo({ ...newVideo, todo: updatedTodos })
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewVideo({
                        ...newVideo,
                        todo: [...newVideo.todo, ''],
                      })
                    }
                  >
                    + Add Another Item
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload Supporting Document (optional)
                  </label>
                  <FileUpload
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      setUploadingDoc(true)
                      setUploadError(null)

                      try {
                        const storage = getStorage()
                        const fileRef = storageRef(
                          storage,
                          `videos/${programId}/${moduleId}/${file.name}`,
                        )

                        await uploadBytes(fileRef, file)
                        const downloadUrl = await getDownloadURL(fileRef)

                        setNewVideo((prev) => ({
                          ...prev,
                          documentUrl: downloadUrl,
                        }))
                      } catch (error) {
                        console.error('Upload failed', error)
                        setUploadError(
                          'Failed to upload document. Please try again.',
                        )
                      } finally {
                        setUploadingDoc(false)
                      }
                    }}
                    label="Upload Supporting Document"
                  />
                </div>
                {uploadingDoc && (
                  <p className="text-xs text-blue-600 mt-1">
                    Uploading document...
                  </p>
                )}

                {uploadError && (
                  <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                )}

                {newVideo.documentUrl && !uploadingDoc && !uploadError && (
                  <p className="text-xs text-green-600 mt-1">
                    Document uploaded successfully ✅
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setNewVideo({
                      title: '',
                      description: '',
                      youtubeId: '',
                      duration: '00:00',
                      order: 1,
                      todo: [''],
                      documentUrl: '',
                    })
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                  onClick={handleAddVideo}
                >
                  Add Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Videos list */}
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden rounded-xl shadow-sm border-0"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="flex-shrink-0 cursor-pointer mt-1"
                      onClick={() => toggleVideoCompletion(video.id)}
                    >
                      {video.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <VideoIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {video.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {video.description}
                      </p>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{video.duration}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Youtube className="h-3 w-3" />
                          <span className="font-mono">{video.youtubeId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(video)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleVideoCompletion(video.id)}
                      >
                        {video.completed ? (
                          <>
                            <Circle className="mr-2 h-4 w-4" />
                            <span>Mark as Incomplete</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(video)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Button
                    variant="outline"
                    className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 text-sm w-full sm:w-auto"
                    onClick={() =>
                      window.open(
                        `https://youtube.com/watch?v=${video.youtubeId}`,
                        '_blank',
                      )
                    }
                  >
                    <Youtube className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <VideoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No videos found
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first video to this module
              </p>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Video
              </Button>
            </div>
          )}
        </div>

        {/* Edit Video Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4 my-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Video Title
                  </label>
                  <Input
                    id="edit-title"
                    value={selectedVideo.title}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>
                  <Textarea
                    id="edit-description"
                    value={selectedVideo.description}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit-youtubeId"
                    className="text-sm font-medium"
                  >
                    YouTube Video ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-youtubeId"
                      value={selectedVideo.youtubeId}
                      onChange={(e) => {
                        const extractedId = extractYouTubeId(e.target.value)
                        fetchVideoDuration(extractedId, 'selectedVideo') // 🪄 auto-fetch
                        setSelectedVideo({
                          ...selectedVideo,
                          youtubeId: extractedId,
                        })
                      }}
                      placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
                    />
                    <Button
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() =>
                        window.open(
                          `https://youtube.com/watch?v=${selectedVideo.youtubeId}`,
                          '_blank',
                        )
                      }
                    >
                      <Youtube className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-duration"
                      className="text-sm font-medium"
                    >
                      Duration
                    </label>
                    <Input
                      id="edit-duration"
                      value={selectedVideo.duration}
                      onChange={(e) =>
                        setSelectedVideo({
                          ...selectedVideo,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-order" className="text-sm font-medium">
                      Order
                    </label>
                    <Input
                      id="edit-order"
                      type="number"
                      min="1"
                      value={selectedVideo.order}
                      onChange={(e) =>
                        setSelectedVideo({
                          ...selectedVideo,
                          order: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">
                    To-Do List (optional)
                  </label>
                  {selectedVideo.todo?.map((item: any, index: any) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        className="flex-1"
                        value={item}
                        onChange={(e) => {
                          const updatedTodos = [...selectedVideo.todo]
                          updatedTodos[index] = e.target.value
                          setSelectedVideo({
                            ...selectedVideo,
                            todo: updatedTodos,
                          })
                        }}
                        placeholder={`To-do item #${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const updatedTodos = selectedVideo.todo.filter(
                            (_: any, i: any) => i !== index,
                          )
                          setSelectedVideo({
                            ...selectedVideo,
                            todo: updatedTodos,
                          })
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedVideo({
                        ...selectedVideo,
                        todo: [...(selectedVideo.todo || []), ''],
                      })
                    }
                  >
                    + Add Another Item
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-completed"
                    checked={selectedVideo.completed}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        completed: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="edit-completed" className="text-sm">
                    Mark as completed
                  </label>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                onClick={handleEditVideo}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px] mx-4">
            <DialogHeader>
              <DialogTitle>Delete Video</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete "{selectedVideo?.title}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteVideo}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
