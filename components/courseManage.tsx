"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle,
  Circle,
  Clock,
  PlayCircle,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./video-player";

export function CourseManagement() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(67);

  const courseVideos = [
    {
      id: "1",
      title: "Introduction to Nutrition Basics",
      duration: "12:30",
      videoId: "dQw4w9WgXcQ", // Example YouTube video ID
      completed: true,
    },
    {
      id: "2",
      title: "Understanding Macronutrients",
      duration: "18:45",
      videoId: "9bZkp7q19f0", // Example YouTube video ID
      completed: true,
    },
    {
      id: "3",
      title: "Protein Intake and Muscle Growth",
      duration: "15:20",
      videoId: "JGwWNGJdvx8", // yt vid ID
      completed: false,
    },
    {
      id: "4",
      title: "Optimizing Fat Loss Strategies",
      duration: "22:15",
      videoId: "kJQP7kiw5Fk", //yt vid ID
      completed: false,
    },
  ];

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const handleVideoComplete = (videoId: string) => {
    // completion percentage
    const totalVideos = courseVideos.length;
    const completedVideos = courseVideos.filter(
      (video) => video.completed || video.videoId === videoId
    ).length;

    const newPercentage = Math.round((completedVideos / totalVideos) * 100);
    setCompletionPercentage(newPercentage);
  };

  return (
    <div>
      <div className="px-6 pb-8">
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Customized Pathway</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600">Likelihood of Success:</span>
                <span className="text-blue-500 font-medium flex items-center">
                  Moderate
                  <svg
                    className="w-5 h-5 ml-1 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <Avatar className="h-10 w-10 mt-2 md:mt-0">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback className="bg-blue-500 text-white">JD</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Video player and course videos */}
            <div className="lg:col-span-2">
              <Card className="mb-6 overflow-hidden rounded-2xl shadow-sm border-0">
                <CardContent className="p-0">
                  <div className="aspect-video w-full">
                    {selectedVideo ? (
                      <VideoPlayer
                        videoId={selectedVideo}
                        onComplete={() => handleVideoComplete(selectedVideo)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            Select a video to start learning
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <h2 className="text-xl font-semibold mb-4">Course Videos</h2>
              <div className="space-y-3">
                {courseVideos.map((video) => (
                  <Card
                    key={video.id}
                    className={`cursor-pointer transition-colors rounded-xl shadow-sm ${
                      selectedVideo === video.videoId
                        ? "border-blue-500 bg-blue-50"
                        : "border-0"
                    }`}
                    onClick={() => handleVideoSelect(video.videoId)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {video.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{video.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <PlayCircle className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right column - Progress and action items */}
            <div className="lg:col-span-1">
              <Card className="mb-6 rounded-xl shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      Simulation: Drop body fat percentage
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-500 flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Moderate
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <Card className="rounded-xl shadow-sm border-0">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Clinics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <span className="font-medium">Open Office Hours</span>
                          </div>
                          <Progress value={75} className="h-2 mt-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg
                            className="h-5 w-5 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-2 pb-8 hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              Customized Pathway
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-600">Likelihood of Success:</span>
              <span className="text-blue-500 font-medium flex items-center">
                Moderate
                <svg
                  className="w-5 h-5 ml-1 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>
          <Avatar className="h-10 w-10 mt-2 md:mt-0">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback className="bg-blue-500 text-white">JD</AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Video player and course videos */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-0 overflow-hidden">
                <div className="aspect-video w-full">
                  {selectedVideo ? (
                    <VideoPlayer
                      videoId={selectedVideo}
                      onComplete={() => handleVideoComplete(selectedVideo)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Select a video to start learning
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4 text-black">
              Course Videos
            </h2>
            <div className="space-y-3">
              {courseVideos.map((video) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVideo === video.videoId
                      ? "border-blue-500 bg-blue-50 text-black"
                      : "bg-white text-black"
                  }`}
                  onClick={() => handleVideoSelect(video.videoId)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {video.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{video.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right column - Progress and action items */}
          <div className="lg:col-span-1">
            <Card className="mb-6 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2 ">
                  <h3 className="font-semibold text-black">
                    Simulation: Drop body fat percentage
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-500 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Moderate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 ">
              <Card className="bg-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-black">Clinics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between text-black">
                          <span className="font-medium">Open Office Hours</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-black">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg
                          className="h-5 w-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between text-black">
                          <span className="font-medium">Supplement Clinic</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full ">
                        <svg
                          className="h-5 w-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between text-black">
                          <span className="font-medium">Medication Clinic</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-black">Action Items</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-black">
                          Increase daily protein intake
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-black">Reduce sugar consumption</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-black">
                          Perform strength training x3 week
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-black">Completion</h3>
                  <Progress value={completionPercentage} className="h-3" />
                  <div className="text-right mt-2 font-bold text-lg text-black">
                    {completionPercentage}%
                  </div>

                  <h3 className="font-semibold mt-6 mb-3 text-black">Team</h3>
                  <div className="flex -space-x-2">
                    <Avatar className="border-2 border-white">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Team member"
                      />
                      <AvatarFallback className="bg-blue-500 text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-white">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Team member"
                      />
                      <AvatarFallback className="bg-purple-500 text-white">
                        ST
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-white">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Team member"
                      />
                      <AvatarFallback className="bg-green-500 text-white">
                        KL
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-white">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Team member"
                      />
                      <AvatarFallback className="bg-orange-500 text-white">
                        MJ
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-white">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Team member"
                      />
                      <AvatarFallback className="bg-pink-500 text-white">
                        AR
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Thrive Team Approval
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
