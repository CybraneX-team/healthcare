"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle, Clock, ArrowLeft, ThumbsUp } from "lucide-react";
import { YouTubePlayer } from "./ytPlayer";

interface VideoPlayerViewProps {
  programId: string;
  moduleId: string;
  videoId: string;
  programData: any; // 🟡 Real dynamic data
  onBack: () => void;
  completedVideos: any
  onMarkComplete: (videoId: string, moduleId: string) => void;
  moduleProgress: Record<string, number>;
  moduleTitle : any;
  videoTitle  : any;
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
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [videoProgress, setVideoProgress] = useState(0);
  const [comments, setComments] = useState<any[]>([]);


  // console.log( "programId",  programId , "moduleId" , moduleId, "videoId" , videoId, "video-title" ,videoTitle  ,"module-title", moduleTitle)
  // Update current video when videoId changes
  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId]);
  
  
  // Get module and video data from programData
  const moduleData = programData.modules[moduleId];
  
  const moduleVideos = Object.values(moduleData?.videos || {});
  const currentVideo : any =
    moduleVideos.find((v: any) => v.id === currentVideoId) || moduleVideos[0];
  const currentYoutubeId = currentVideo.youtubeId;
  const currentLessonNumber =
    moduleVideos.findIndex((v: any) => v.id === currentVideoId) + 1;

  const handleVideoSelect = (id: string) => {
    setCurrentVideoId(id);
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
          <h1 className="text-lg font-bold text-gray-900">{moduleData.title}</h1>
          <div className="text-sm text-gray-500">
            Stage {currentLessonNumber} • {currentVideo?.title || ""}
          </div>
        </div>
        <div className="ml-auto px-8">
         <Button
  onClick={handleMarkComplete}
  disabled={!!completedVideos?.[programId]?.[moduleId]?.includes(currentVideoId)}
  className={`rounded-full px-4 py-2 text-sm ${
    !!completedVideos?.[programId]?.[moduleId]?.includes(currentVideoId)
      ? "bg-green-500 hover:bg-green-600 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`}
>
  {!!completedVideos?.[programId]?.[moduleId]?.includes(currentVideoId)
    ? "Completed"
    : "Mark Complete"}
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
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleVideoSelect(video.id)}
                  >
                    <div className="flex items-center gap-3">
                      {
                      !!completedVideos?.[programId]?.[moduleId]?.includes(video.id) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )
                    }
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

            <div>
              <h2> ToDo's </h2>
              {moduleVideos.map((video: any, index: number) => (
            <div key={index}>
              {video?.todo?.length > 0 ? (
                video.todo.map((item: any, idx: number) => (
                  <div key={idx}>{item}</div>
                ))
              ) : (
                <div>no todo available</div>
              )}
            </div>
          ))}

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
