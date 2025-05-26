"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle, Circle, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ModuleOverviewProps {
  programId: string;
  onModuleSelect: (moduleId: string, videoId: string) => void;
  onBack: () => void;
  completedVideos: Record<string, boolean>;
  moduleProgress: Record<string, number>;
}

export function ModuleOverview({
  programId,
  onModuleSelect,
  onBack,
  completedVideos,
  moduleProgress,
}: ModuleOverviewProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "mission-control": true,
    "rapid-success": false,
    "may-religion": false,
    "june-meaning": false,
    "june-alignment": false,
    "july-bioenergetics": false,
    "august-medicine": false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Mock data for the program
  const programData = {
    id: programId,
    name: "Thrivemed Hub",
    description: "Propel Your Quest for Peak Performance and Fulfillment",
    dateRegistered: "May 15, 2025",
    totalModules: 32,
    unlockedModules: 32,
    sections: [
      {
        id: "mission-control",
        title: "Mission Control",
        progress: moduleProgress["mission-control"] || 0,
        modules: [
          { id: "welcome", title: "Welcome", videoId: "welcome-video" },
          {
            id: "office-hours",
            title: "Open Office Hours Schedule",
            videoId: "office-hours-video",
          },
          {
            id: "session-recordings",
            title: "Open Session Recordings",
            videoId: "session-recordings-video",
          },
        ],
      },
      {
        id: "rapid-success",
        title: "Rapid Success Path",
        progress: moduleProgress["rapid-success"] || 0,
        modules: [
          {
            id: "onboarding",
            title: "Onboarding Overview",
            videoId: "onboarding-video",
          },
          {
            id: "april-meaning",
            title: "April Meaning",
            videoId: "april-meaning-video",
          },
        ],
      },
      {
        id: "may-religion",
        title: "May - Religion, Spirituality, Death and Longevity",
        progress: moduleProgress["may-religion"] || 0,
        modules: [
          {
            id: "religion-health",
            title: "Religion, Health, Morality Patterns",
            videoId: "religion-health-video",
          },
          {
            id: "buthan",
            title: "Buthan, impermanence and Health",
            videoId: "buthan-video",
          },
          { id: "grief", title: "Stages of Grief", videoId: "grief-video" },
          {
            id: "body-telling",
            title: "What is your Body Telling you?",
            videoId: "body-telling-video",
          },
        ],
      },
      {
        id: "june-meaning",
        title: "June - Meaning",
        progress: moduleProgress["june-meaning"] || 0,
        modules: [
          {
            id: "module-1",
            title: "Module 1: The 6th Stage of Growth",
            videoId: "module-1-video",
          },
          {
            id: "module-2",
            title: "Module 2 - Viktor Frankle",
            videoId: "module-2-video",
          },
          {
            id: "module-3",
            title: "Module 3 - Ikigai",
            videoId: "module-3-video",
          },
        ],
      },
      {
        id: "june-alignment",
        title: "June - Alignment",
        progress: moduleProgress["june-alignment"] || 0,
        modules: [],
      },
      {
        id: "july-bioenergetics",
        title: "July - Leverage Bioenergetics",
        progress: moduleProgress["july-bioenergetics"] || 0,
        modules: [],
      },
      {
        id: "august-medicine",
        title: "August - Fast Medicine",
        progress: moduleProgress["august-medicine"] || 0,
        modules: [],
      },
    ],
  };

  return (
    <div className="min-h-screen text-black">
      {/* Header */}
      <div className="py-6 px-8 flex items-center">
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
              {programData.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="absolute inset-0">
                          <svg viewBox="0 0 100 100" className="h-full w-full">
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
                                section.progress === 100 ? "#10b981" : "#3b82f6"
                              }
                              strokeWidth="10"
                              fill="none"
                              strokeDasharray={`${section.progress * 2.51} 251`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium">
                          {section.progress}%
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedSections[section.id]
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </div>

                  {expandedSections[section.id] &&
                    section.modules.length > 0 && (
                      <div>
                        {section.modules.map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              onModuleSelect(section.id, module.videoId)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {completedVideos[module.videoId] ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300" />
                              )}
                              <span className="text-sm text-gray-900">
                                {module.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
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
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">
                        7 Stages, 32 Modules
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
                        <span className="text-gray-600">Modules</span>
                        <span className="font-medium text-gray-900">
                          {programData.totalModules}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Unlocked modules</span>
                        <span className="font-medium text-gray-900">
                          {programData.unlockedModules}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">
                          Overall Completion
                        </span>
                        <span className="font-medium text-gray-900">
                          {Math.round(
                            Object.values(moduleProgress).reduce(
                              (sum, val) => sum + val,
                              0
                            ) / Object.values(moduleProgress).length
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Content
                </h2>
                <div className="text-sm text-gray-500">
                  {programData.sections.reduce(
                    (total, section) => total + section.modules.length,
                    0
                  )}{" "}
                  lessons
                </div>
              </div>

              <div className="space-y-4">
                {programData.sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">
                        {section.title}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {section.modules.length} lessons • {section.progress}%
                        complete
                      </div>
                    </div>
                    <div className="p-2">
                      <Progress value={section.progress} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
