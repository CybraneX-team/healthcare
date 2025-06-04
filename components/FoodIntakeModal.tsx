"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UploadCloud, Menu, X } from "lucide-react";
import Image from "next/image";

interface FoodIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodIntakeModal({ isOpen, onClose }: FoodIntakeModalProps) {
  const [selectedTab, setSelectedTab] = useState("Meal Intake");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [manualEntries, setManualEntries] = useState({
    carbohydrates: 0,
    fats: 0,
    protein: 0,
    total: 0
  });

  const tabs = ["Meal Intake", "Workout", "Sleep periods", "Cardio", "Weight"];

  // Sample food stats data
  const foodStats = {
    carbohydrates: 2500,
    fats: 1200,
    protein: 12,
    total: 3700
  };

  // Handle file upload (placeholder)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Process file upload logic would go here
    console.log("File uploaded:", e.target.files);
  };

  // Update manual entries
  const updateManualEntry = (field: keyof typeof manualEntries, value: number) => {
    const newEntries = { ...manualEntries, [field]: value };
    newEntries.total = newEntries.carbohydrates + newEntries.fats + newEntries.protein;
    setManualEntries(newEntries);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full h-full sm:w-[95vw] sm:h-[95vh] max-w-7xl flex flex-col sm:flex-row overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="flex items-center text-gray-600"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
          
          <h2 className="text-lg font-bold">{selectedTab}</h2>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar - hidden on mobile unless toggled */}
        <div className={`
          ${isSidebarOpen ? 'block' : 'hidden'} sm:block
          w-full sm:w-64 bg-gray-50 p-4 sm:rounded-l-3xl border-r border-gray-100
          absolute sm:relative z-10 sm:z-auto h-full sm:h-auto
        `}>
          {/* Desktop back button */}
          <button 
            onClick={onClose}
            className="hidden sm:flex items-center text-gray-600 mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          
          {/* Navigation tabs */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedTab === tab 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="sm:hidden fixed inset-0 bg-black/20 z-5"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col">
          <div className="mb-6 sm:mb-8 flex-shrink-0">
            <h2 className="hidden sm:block text-xl sm:text-2xl font-bold">Upload Food Image</h2>
            <p className="hidden sm:block text-gray-600">Click to upload or Drag and drop</p>
          </div>
          
          {/* Upload area - full height */}
          <div className="flex-1 border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-8 sm:p-16 lg:p-40 flex items-center justify-center relative overflow-hidden min-h-[300px]">
            {/* Background placeholder image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <Image
                src="/kcal_placeholder.png"
                alt="Food placeholder"
                width={1000}
                height={1000}
                className="object-contain max-w-full max-h-full"
              />
            </div>
            
            {/* Upload content */}
            <label className="cursor-pointer flex flex-col items-center relative z-10">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="mb-2 sm:mb-4 text-blue-500">
                <UploadCloud size={32} className="sm:w-16 sm:h-16" />
              </div>
              <span className="text-gray-500 text-sm sm:text-base text-center">Click to upload or drag and drop</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 