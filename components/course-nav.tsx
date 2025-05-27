"use client";

import {
  Home,
  BookOpen,
  Video,
  User,
  Settings,
  MessageSquare,
  BarChart,
} from "lucide-react";

interface VerticalNavProps {
  currentView: "programs" | "modules" | "video";
}

export function VerticalNav({ currentView }: VerticalNavProps) {
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
    <div className="fixed right-60 top-20 bottom-0 w-16  z-10 flex-col items-center py-8 hidden md:flex">
      {/* Timeline with icons */}
      <div className="flex space-y-8 relative">
        {/* Vertical line connecting the circles */}
        <div className="absolute top-6 bottom-6 w-0.5  -z-10"></div>

        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-2 ${
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
