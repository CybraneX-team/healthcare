"use client";

import { Home, BookOpen, Video } from "lucide-react";

interface HorizontalNavProps {
  currentView: "programs" | "modules" | "video";
}

export function HorizontalNav({ currentView }: HorizontalNavProps) {
  const steps = [
    {
      id: "programs",
      icon: Home,
      active: true,
      completed: currentView !== "programs",
    },
    {
      id: "modules",
      icon: BookOpen,
      active: currentView !== "programs",
      completed: currentView === "video",
    },
    {
      id: "video",
      icon: Video,
      active: currentView === "video",
      completed: false,
    },
  ];

  return (
    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-auto z-10 flex-row items-center px-8 hidden md:flex">
      {/* Timeline with icons */}
      <div className="flex space-x-8 relative">
        {/* Horizontal line connecting the circles */}
        <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-300 -z-10"></div>

        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.active
                  ? step.completed
                    ? "bg-blue-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
