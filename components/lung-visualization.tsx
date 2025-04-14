"use client"
import Image from "next/image"

export function LungVisualization() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[80%] h-[80%]">
        <Image
          src="/placeholder.svg?height=500&width=400"
          alt="Lung visualization"
          fill
          className="object-contain"
          priority
        />

        {/* Heart rate indicator */}
        <div className="absolute top-[30%] left-[25%] bg-white/80 rounded-full p-1 shadow-sm text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-blue-500 font-medium">Heart rate</span>
          </div>
        </div>

        {/* Lung visualization overlay elements */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M200,100 Q240,150 240,200 Q240,300 200,350 Q160,300 160,200 Q160,150 200,100"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M140,150 Q100,200 100,250 Q100,350 150,400 Q200,350 200,250 Q200,200 140,150"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M260,150 Q300,200 300,250 Q300,350 250,400 Q200,350 200,250 Q200,200 260,150"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
