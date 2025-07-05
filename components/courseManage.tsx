'use client'

import { useState, useEffect } from 'react'
import { ProgramsList } from '@/components/programs'
import { ModuleOverview } from '@/components/module'
import { VideoPlayerView } from '@/components/videoView'
import { HorizontalNav } from '@/components/course-nav'
import { ref, onValue, set } from 'firebase/database'
import { db, rtdb } from '@/utils/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { ProgramProvider } from '@/hooks/useProgressData'

export default function Course() {
  const [currentView, setCurrentView] = useState<
    'programs' | 'modules' | 'video'
  >('programs')
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [moduleTitle, setmoduleTitle] = useState<string | null>(null)
  const [videoTitle, setvideoTitle] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [programData, setProgramData] = useState<any>(null)
  const [AllModuleProgress, setAllModuleProgress] = useState<any>({})
  const [programProgresses, setProgramProgresses] = useState<
    Record<string, number>
  >({})
  const [completedVideos, setCompletedVideos] = useState<
    Record<string, Record<string, string[]>>
  >({})
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>(
    {},
  )

  type ModuleData = {
    videos?: Record<string, any> // adjust to your video's type if needed
    [key: string]: any
  }
  // Load program data from RTDB
  useEffect(() => {
    if (selectedProgram) {
      const programRef = ref(
        rtdb,
        `courses/thrivemed/programs/${selectedProgram}`,
      )
      const unsubscribe = onValue(programRef, (snapshot) => {
        const data = snapshot.val()
        if (data) setProgramData(data)
      })
      return () => unsubscribe()
    }
  }, [selectedProgram])

  useEffect(() => {
    const fetchCompletedVideos = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user || !selectedProgram) return

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        setCompletedVideos(data.completedVideos || {})
      }
    }

    fetchCompletedVideos()
  }, [selectedProgram])

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId)
    setCurrentView('modules')
  }

  const handleModuleSelect = (
    moduleId: string,
    videoId: string,
    moduleTitle: string,
    videoTitle: string,
  ) => {
    setSelectedModule(moduleId)
    setSelectedVideo(videoId)
    setmoduleTitle(moduleTitle)
    setvideoTitle(videoTitle)
    setCurrentView('video')
  }

  const handleBackToPrograms = () => {
    setCurrentView('programs')
    setSelectedProgram(null)
    setSelectedModule(null)
    setSelectedVideo(null)
  }

  const handleBackToModules = () => {
    setCurrentView('modules')
    setSelectedModule(null)
    setSelectedVideo(null)
  }

  //   const handleMarkVideoComplete = async (videoId: string, moduleId: string) => {
  //   console.log("selectedprogramme", selectedProgram)
  //   setCompletedVideos((prev) => ({
  //     ...prev,
  //     [videoId]: true,
  //   }));

  //   const auth = getAuth();
  //   const user = auth.currentUser;
  //   if (!user || !selectedProgram) return;

  //   const userRef = doc(db, "users", user.uid);
  //   const userSnap = await getDoc(userRef);

  //   // 1️⃣ Update completed videos
  //   const prevCompletedVideos = userSnap.data()?.completedVideos || {};
  //   const programVideos = prevCompletedVideos[selectedProgram] || {};
  //   const moduleVideos = new Set(programVideos[moduleId] || []);
  //   console.log("moduleVideos",moduleVideos)
  //   moduleVideos.add(videoId);

  //   const updatedCompletedVideos = {
  //     ...prevCompletedVideos,
  //     [selectedProgram]: {
  //       ...programVideos,
  //       [moduleId]: Array.from(moduleVideos),
  //     },
  //   };

  //   // 2️⃣ Fetch ALL modules from RTDB (includes new ones)
  //   const programRef = ref(rtdb, `courses/thrivemed/programs/${selectedProgram}`);
  //   const programSnap = await new Promise<any>((resolve) => {
  //     onValue(programRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
  //   });
  //   const modules = (programSnap.modules || {}) as Record<string, ModuleData>;  console.log("modules", modules)
  //   // 3️⃣ Recalculate module progress for ALL modules
  //   const newModuleProgress: Record<string, number> = {};
  //   let totalVideosCount = 0;
  //   let totalCompletedCount = 0;

  //   for (const [modId, modData] of Object.entries(modules)) {
  //     const totalVideos = Object.keys(modData.videos || {}).length;
  //     const completedCount = (updatedCompletedVideos[selectedProgram]?.[modId] || []).length;
  //     const progress = totalVideos === 0 ? 0 : Math.round((completedCount / totalVideos) * 100);

  //     newModuleProgress[modId] = progress;

  //     totalVideosCount += totalVideos;
  //     totalCompletedCount += completedCount;
  //   }

  //   // 4️⃣ Recalculate program progress
  //   const allModuleProgresses = Object.values(newModuleProgress);
  //    const programProgressPercent =
  //     totalVideosCount === 0 ? 0 : Math.round((totalCompletedCount / totalVideosCount) * 100);

  //   console.log("programProgressPercent (weighted)", programProgressPercent);
  //   // 5️⃣ Update Firestore
  //     await updateDoc(userRef, {
  //       [`completedVideos.${selectedProgram}`]: {
  //         ...programVideos,
  //         [moduleId]: Array.from(moduleVideos),
  //       },
  //       [`moduleProgress.${selectedProgram}`]: newModuleProgress,
  //       [`programProgress.${selectedProgram}`]: programProgressPercent,
  //     });

  //      if (programProgressPercent === 100) {
  //     const programStatusRef = ref(rtdb, `courses/thrivemed/programs/${selectedProgram}/status`);
  //     await set(programStatusRef, "completed");
  //   }
  //     // Recalculate ALL program progress to ensure consistency
  //     setModuleProgress(newModuleProgress);
  // };

  const handleMarkVideoComplete = async (videoId: string, moduleId: string) => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user || !selectedProgram) return

    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    const prevCompletedVideos = userSnap.data()?.completedVideos || {}
    const programVideos = prevCompletedVideos[selectedProgram] || {}
    const moduleVideos = new Set(programVideos[moduleId] || [])

    moduleVideos.add(videoId) // ✅ Mark current video complete

    const updatedCompletedVideos = {
      ...prevCompletedVideos,
      [selectedProgram]: {
        ...programVideos,
        [moduleId]: Array.from(moduleVideos),
      },
    }

    // 1️⃣ Fetch full program structure from RTDB
    const programRef = ref(
      rtdb,
      `courses/thrivemed/programs/${selectedProgram}`,
    )
    const programSnap = await new Promise<any>((resolve) => {
      onValue(programRef, (snapshot) => resolve(snapshot.val()), {
        onlyOnce: true,
      })
    })

    const modules = (programSnap.modules || {}) as Record<string, ModuleData>
    const newModuleProgress: Record<string, number> = {}

    let totalVideosCount = 0
    let totalCompletedCount = 0

    // 2️⃣ Loop through all modules to recalculate progress
    for (const [modId, modData] of Object.entries(modules)) {
      const videoIds = Object.keys(modData.videos || {})
      const completedIds =
        updatedCompletedVideos[selectedProgram]?.[modId] || []

      totalVideosCount += videoIds.length
      totalCompletedCount += completedIds.length

      const progress =
        videoIds.length === 0
          ? 0
          : Math.round((completedIds.length / videoIds.length) * 100)

      newModuleProgress[modId] = progress
    }

    // 3️⃣ Calculate program progress %
    const programProgressPercent =
      totalVideosCount === 0
        ? 0
        : Math.round((totalCompletedCount / totalVideosCount) * 100)

    // 4️⃣ Update Firestore fields
    await updateDoc(userRef, {
      [`completedVideos.${selectedProgram}`]:
        updatedCompletedVideos[selectedProgram],
      [`moduleProgress.${selectedProgram}`]: newModuleProgress,
      [`programProgress.${selectedProgram}`]: programProgressPercent,
      [`programStatus.${selectedProgram}`]:
        programProgressPercent === 100 ? 'completed' : 'active',
    })

    // 5️⃣ Update local state for UI sync
    setCompletedVideos(updatedCompletedVideos)
    setModuleProgress(newModuleProgress)

    // console.log(`Program ${selectedProgram} progress: ${programProgressPercent}%`)
  }

  return (
    <div className="min-h-screen flex -mt-10">
      <div className="">
        <HorizontalNav currentView={currentView} />
      </div>
      <div className="flex-1 md:ml-16">
        {currentView === 'programs' && (
          <ProgramsList
            onProgramSelect={handleProgramSelect}
            moduleProgress={AllModuleProgress}
            programProgress={programProgresses}
          />
        )}

        {currentView === 'modules' && selectedProgram && (
          <ModuleOverview
            programId={selectedProgram}
            onModuleSelect={handleModuleSelect}
            onBack={handleBackToPrograms}
            completedVideos={completedVideos}
            moduleProgress={moduleProgress}
          />
        )}

        {currentView === 'video' &&
          selectedProgram &&
          selectedModule &&
          selectedVideo &&
          programData &&
          moduleTitle &&
          videoTitle && (
            <VideoPlayerView
              programId={selectedProgram}
              moduleId={selectedModule}
              videoId={selectedVideo}
              moduleTitle={moduleTitle}
              videoTitle={videoTitle}
              programData={programData}
              onBack={handleBackToModules}
              completedVideos={completedVideos}
              onMarkComplete={handleMarkVideoComplete}
              moduleProgress={moduleProgress}
            />
          )}
      </div>
    </div>
  )
}
