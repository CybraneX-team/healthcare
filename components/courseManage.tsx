"use client";

import { useState } from "react";
import { ProgramsList } from "@/components/programs";
import { ModuleOverview } from "@/components/module";
import { VideoPlayerView } from "@/components/videoView";
import { VerticalNav } from "@/components/course-nav";

export default function Course() {
  const [currentView, setCurrentView] = useState<
    "programs" | "modules" | "video"
  >("programs");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Track completed videos across the entire application
  const [completedVideos, setCompletedVideos] = useState<
    Record<string, boolean>
  >({});
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({
    "mission-control": 0,
    "rapid-success": 0,
    "may-religion": 0,
    "june-meaning": 0,
    "june-alignment": 0,
    "july-bioenergetics": 0,
    "august-medicine": 0,
  });

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    setCurrentView("modules");
  };

  const handleModuleSelect = (moduleId: string, videoId: string) => {
    setSelectedModule(moduleId);
    setSelectedVideo(videoId);
    setCurrentView("video");
  };

  const handleBackToPrograms = () => {
    setCurrentView("programs");
    setSelectedProgram(null);
    setSelectedModule(null);
    setSelectedVideo(null);
  };

  const handleBackToModules = () => {
    setCurrentView("modules");
    setSelectedModule(null);
    setSelectedVideo(null);
  };

  const handleMarkVideoComplete = (videoId: string, moduleId: string) => {
    // Mark video as completed
    setCompletedVideos((prev) => ({
      ...prev,
      [videoId]: true,
    }));

    // Update module progress
    if (moduleId) {
      // Get all videos for this module
      const moduleVideos = getModuleVideos(moduleId);

      // Count completed videos in this module
      const completedCount = moduleVideos.filter(
        (video) => completedVideos[video.id] || video.id === videoId
      ).length;

      // Calculate new progress percentage
      const newProgress = Math.round(
        (completedCount / moduleVideos.length) * 100
      );

      // Update module progress
      setModuleProgress((prev) => ({
        ...prev,
        [moduleId]: newProgress,
      }));
    }
  };

  // Helper function to get videos for a specific module
  const getModuleVideos = (moduleId: string) => {
    // This is a simplified example - in a real app you'd have a more sophisticated data structure
    const allModules = {
      welcome: [
        { id: "welcome-video", title: "Welcome to Thrivemed Hub" },
        { id: "intro-video", title: "Introduction to the Program" },
      ],
      "office-hours": [
        { id: "office-hours-video", title: "Open Office Hours Schedule" },
      ],
      "session-recordings": [
        { id: "session-recordings-video", title: "Open Session Recordings" },
      ],
      "mission-control": [
        { id: "welcome-video", title: "Welcome to Thrivemed Hub" },
        { id: "office-hours-video", title: "Open Office Hours Schedule" },
        { id: "session-recordings-video", title: "Open Session Recordings" },
      ],
      "rapid-success": [
        { id: "onboarding-video", title: "Onboarding Overview" },
        { id: "april-meaning-video", title: "April Meaning" },
      ],
      "may-religion": [
        {
          id: "religion-health-video",
          title: "Religion, Health, Morality Patterns",
        },
        { id: "buthan-video", title: "Buthan, impermanence and Health" },
        { id: "grief-video", title: "Stages of Grief" },
        { id: "body-telling-video", title: "What is your Body Telling you?" },
      ],
      "june-meaning": [
        { id: "module-1-video", title: "Module 1: The 6th Stage of Growth" },
        { id: "module-2-video", title: "Module 2 - Viktor Frankle" },
        { id: "module-3-video", title: "Module 3 - Ikigai" },
      ],
    };

    return allModules[moduleId as keyof typeof allModules] || [];
  };

  return (
    <div className="min-h-screen flex -mt-10">
      <VerticalNav currentView={currentView} />

      <div className="flex-1 md:ml-16">
        {currentView === "programs" && (
          <ProgramsList
            onProgramSelect={handleProgramSelect}
            moduleProgress={moduleProgress}
          />
        )}

        {currentView === "modules" && selectedProgram && (
          <ModuleOverview
            programId={selectedProgram}
            onModuleSelect={handleModuleSelect}
            onBack={handleBackToPrograms}
            completedVideos={completedVideos}
            moduleProgress={moduleProgress}
          />
        )}

        {currentView === "video" &&
          selectedProgram &&
          selectedModule &&
          selectedVideo && (
            <VideoPlayerView
              programId={selectedProgram}
              moduleId={selectedModule}
              videoId={selectedVideo}
              onBack={handleBackToModules}
              completedVideos={completedVideos}
              onMarkComplete={handleMarkVideoComplete}
              moduleProgress={moduleProgress}
            />
          )}
      </div>
    </div>
  );
}
