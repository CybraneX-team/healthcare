"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UploadCloud } from "lucide-react";
import Image from "next/image";

interface FoodIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodIntakeModal({ isOpen, onClose }: FoodIntakeModalProps) {
  const [selectedTab, setSelectedTab] = useState("Meal Intake");
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl w-[95vw] h-[95vh] max-w-[100vw] flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-gray-50 p-4 rounded-l-3xl border-r border-gray-100">
          <button 
            onClick={onClose}
            className="flex items-center text-gray-600 mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          
          {/* Navigation tabs */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
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
        
        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Upload Food Image</h2>
            <p className="text-gray-600">Click to upload or Drag and drop</p>
            
            {/* Upload area */}
            <div className="mt-6 border-2 border-dashed border-blue-300 rounded-2xl p-40 flex items-center justify-center">
              <label className="cursor-pointer flex flex-col items-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <div className="mb-4 text-blue-500">
                  <UploadCloud size={64} />
                </div>
                <span className="text-gray-500">Click to upload or drag and drop</span>
              </label>
            </div>
          </div>
          
          {/* Food stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Food Stats */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-6">Food Stats</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Carbohydrates</span>
                  <span className="font-medium">{foodStats.carbohydrates} <span className="text-gray-500">Kcal</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Fats</span>
                  <span className="font-medium">{foodStats.fats} <span className="text-gray-500">Kcal</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Protein</span>
                  <span className="font-medium">{foodStats.protein} <span className="text-gray-500">gm</span></span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-semibold">{foodStats.total} <span className="text-gray-500">Kcal</span></span>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl"
                >
                  Add to meals
                </Button>
              </div>
            </div>
            
            {/* Right column - Manual Entry */}
            <div className="bg-gray-50 p-6 rounded-2xl md:col-span-2">
              <h3 className="text-xl font-semibold mb-6">Enter Data Manually</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Carbohydrates</span>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-16 text-right bg-transparent"
                      value={manualEntries.carbohydrates}
                      onChange={(e) => updateManualEntry("carbohydrates", parseInt(e.target.value) || 0)}
                    />
                    <span className="text-gray-500 ml-1">Kcal</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Fats</span>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-16 text-right bg-transparent"
                      value={manualEntries.fats}
                      onChange={(e) => updateManualEntry("fats", parseInt(e.target.value) || 0)}
                    />
                    <span className="text-gray-500 ml-1">Kcal</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Protein</span>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-16 text-right bg-transparent"
                      value={manualEntries.protein}
                      onChange={(e) => updateManualEntry("protein", parseInt(e.target.value) || 0)}
                    />
                    <span className="text-gray-500 ml-1">Kcal</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-semibold">{manualEntries.total} <span className="text-gray-500">Kcal</span></span>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl"
                >
                  Add to meals
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 