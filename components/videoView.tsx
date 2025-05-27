"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Circle,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  ArrowLeft,
  ThumbsUp,
} from "lucide-react";
import { YouTubePlayer } from "./ytPlayer";

interface VideoPlayerViewProps {
  programId: string;
  moduleId: string;
  videoId: string;
  onBack: () => void;
  completedVideos: Record<string, boolean>;
  onMarkComplete: (videoId: string, moduleId: string) => void;
  moduleProgress: Record<string, number>;
}

export function VideoPlayerView({
  programId,
  moduleId,
  videoId,
  onBack,
  completedVideos,
  onMarkComplete,
  moduleProgress,
}: VideoPlayerViewProps) {
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId]);

  // Map of video IDs to YouTube video IDs
  const youtubeVideoMap: Record<string, string> = {
    "welcome-video": "dQw4w9WgXcQ",
    "office-hours-video": "9bZkp7q19f0",
    "session-recordings-video": "JGwWNGJdvx8",
    "onboarding-video": "kJQP7kiw5Fk",
    "april-meaning-video": "hT_nvWreIhg",
    "religion-health-video": "fJ9rUzIMcZQ",
    "buthan-video": "YykjpeuMNEk",
    "grief-video": "60ItHLz5WEA",
    "body-telling-video": "2Vv-BfVoq4g",
    "module-1-video": "pRpeEdMmmQ0",
    "module-2-video": "aJOTlE1K90k",
    "module-3-video": "VDvr08sCPOc",
  };

  const moduleData = {
    id: moduleId,
    programId: programId,
    title: getModuleTitle(moduleId),
    programTitle: "Thrivemed Hub",
    videos: getModuleVideos(moduleId),
  };

  function getModuleTitle(moduleId: string): string {
    const moduleTitles: Record<string, string> = {
      "mission-control": "Mission Control",
      "rapid-success": "Rapid Success Path",
      "may-religion": "May - Religion, Spirituality, Death and Longevity",
      "june-meaning": "June - Meaning",
      "june-alignment": "June - Alignment",
      "july-bioenergetics": "July - Leverage Bioenergetics",
      "august-medicine": "August - Fast Medicine",
    };
    return moduleTitles[moduleId] || "Module";
  }

  function getModuleVideos(moduleId: string) {
    // This is a simplified example - in a real app you'd have a more sophisticated data structure
    const allModules: Record<string, any[]> = {
      "mission-control": [
        {
          id: "welcome-video",
          title: "Welcome to Thrivemed Hub",
          duration: "05:12",
        },
        {
          id: "office-hours-video",
          title: "Open Office Hours Schedule",
          duration: "12:30",
        },
        {
          id: "session-recordings-video",
          title: "Open Session Recordings",
          duration: "18:45",
        },
      ],
      "rapid-success": [
        {
          id: "onboarding-video",
          title: "Onboarding Overview",
          duration: "10:25",
        },
        {
          id: "april-meaning-video",
          title: "April Meaning",
          duration: "15:30",
        },
      ],
      "may-religion": [
        {
          id: "religion-health-video",
          title: "Religion, Health, Morality Patterns",
          duration: "22:15",
        },
        {
          id: "buthan-video",
          title: "Buthan, impermanence and Health",
          duration: "14:20",
        },
        { id: "grief-video", title: "Stages of Grief", duration: "19:45" },
        {
          id: "body-telling-video",
          title: "What is your Body Telling you?",
          duration: "16:30",
        },
      ],
      "june-meaning": [
        {
          id: "module-1-video",
          title: "Module 1: The 6th Stage of Growth",
          duration: "11:10",
        },
        {
          id: "module-2-video",
          title: "Module 2 - Viktor Frankle",
          duration: "13:25",
        },
        { id: "module-3-video", title: "Module 3 - Ikigai", duration: "09:50" },
      ],
    };

    return allModules[moduleId] || [];
  }

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const handleVideoComplete = () => {
    onMarkComplete(currentVideoId, moduleId);
  };

  const handleMarkComplete = () => {
    onMarkComplete(currentVideoId, moduleId);
  };

  const handleVideoProgressUpdate = (progress: number) => {
    setVideoProgress(progress);

    if (progress > 95 && !completedVideos[currentVideoId]) {
      handleVideoComplete();
    }
  };

  const currentVideo =
    moduleData.videos.find((v) => v.id === currentVideoId) ||
    moduleData.videos[0];
  const currentYoutubeId =
    youtubeVideoMap[currentVideoId] || youtubeVideoMap[moduleData.videos[0].id];

  const currentLessonNumber =
    moduleData.videos.findIndex((v) => v.id === currentVideoId) + 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-6 md:-ml-6 flex items-center">
        <Button
          variant="ghost"
          className="mr-4 py-5 px-3  rounded-full hover:bg-white "
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {moduleData.title}
          </h1>
          <div className="text-sm text-gray-500">
            Stage {currentLessonNumber} • {currentVideo.title}
          </div>
        </div>
        <div className="ml-auto px-8">
          <Button
            onClick={handleMarkComplete}
            disabled={completedVideos[currentVideoId]}
            className={`rounded-full px-4 py-2 text-sm ${
              completedVideos[currentVideoId]
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {completedVideos[currentVideoId] ? "Completed" : "Mark Complete"}
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
                {moduleData.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`flex items-center p-4 cursor-pointer ${
                      currentVideoId === video.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleVideoSelect(video.id)}
                  >
                    <div className="flex items-center gap-3">
                      {completedVideos[video.id] ? (
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
                  In this lesson, you will learn about{" "}
                  {currentVideo.title.toLowerCase()}. This is an important
                  concept that will help you understand the overall framework
                  and approach to health optimization.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
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

                <div className="flex gap-4 pl-14">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    E
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">Emily</span>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Sure thing, Andrew! You can start by implementing just one
                      aspect at a time. I found that focusing on the morning
                      routine first worked best for me.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp className="h-3 w-3" />
                        <span>3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get stage number from module ID
function getStageNumber(moduleId: string): number {
  const stageMap: Record<string, number> = {
    "mission-control": 1,
    "rapid-success": 2,
    "may-religion": 3,
    "june-meaning": 4,
    "june-alignment": 5,
    "july-bioenergetics": 6,
    "august-medicine": 7,
  };
  return stageMap[moduleId] || 1;
}
