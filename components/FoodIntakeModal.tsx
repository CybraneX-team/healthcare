"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UploadCloud, Menu, X } from "lucide-react";
import Image from "next/image";
import Lottie from 'lottie-react';
import * as animationData from './Vector.json';

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

  // State for habits
  const [habits, setHabits] = useState({
    fasting: {
      enabled: true,
      skipBreakfast: false,
      skipLunch: true,
      skipDinner: true
    },
    sleepSchedule: {
      enabled: false,
      wakeUpTime: "07:15",
      sleepTime: "21:45"
    },
    exercise: {
      enabled: true,
      daysPerWeek: 5
    }
  });

  const tabs = ["Meal Intake", "Water Intake", "Workout", "Sleep periods", "Cardio", "Weight", "Habits"];

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

  // Handle habit changes
  const toggleFasting = () => {
    setHabits(prev => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        enabled: !prev.fasting.enabled
      }
    }));
  };

  const toggleFastingOption = (option: string) => {
    setHabits(prev => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        [option]: !prev.fasting[option as keyof typeof prev.fasting]
      }
    }));
  };

  const toggleSleepSchedule = () => {
    setHabits(prev => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        enabled: !prev.sleepSchedule.enabled
      }
    }));
  };

  const updateSleepTime = (field: 'wakeUpTime' | 'sleepTime', value: string) => {
    setHabits(prev => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        [field]: value
      }
    }));
  };

  const toggleExercise = () => {
    setHabits(prev => ({
      ...prev,
      exercise: {
        ...prev.exercise,
        enabled: !prev.exercise.enabled
      }
    }));
  };

  const renderHabitsContent = () => (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      {/* Left side - Add Habits */}
      <div className="flex-1 lg:max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-bold">Add Habits</h2>
        </div>

        <div className="space-y-6">
          {/* Fasting Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Fasting</h3>
              <button 
                onClick={toggleFasting}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.fasting.enabled 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.fasting.enabled && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              <label className={`flex items-center gap-3 ${habits.fasting.enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  habits.fasting.enabled && habits.fasting.skipBreakfast 
                    ? 'bg-blue-600 border-blue-600' 
                    : habits.fasting.enabled 
                      ? 'border-gray-300' 
                      : 'border-gray-200'
                }`}>
                  {habits.fasting.enabled && habits.fasting.skipBreakfast && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`${habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'}`}>Skip Breakfast</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipBreakfast}
                  disabled={!habits.fasting.enabled}
                  onChange={() => habits.fasting.enabled && toggleFastingOption('skipBreakfast')}
                />
              </label>
              
              <label className={`flex items-center gap-3 ${habits.fasting.enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  habits.fasting.enabled && habits.fasting.skipLunch 
                    ? 'bg-blue-600 border-blue-600' 
                    : habits.fasting.enabled 
                      ? 'border-gray-300' 
                      : 'border-gray-200'
                }`}>
                  {habits.fasting.enabled && habits.fasting.skipLunch && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`${habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'}`}>Skip Lunch</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipLunch}
                  disabled={!habits.fasting.enabled}
                  onChange={() => habits.fasting.enabled && toggleFastingOption('skipLunch')}
                />
              </label>
              
              <label className={`flex items-center gap-3 ${habits.fasting.enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  habits.fasting.enabled && habits.fasting.skipDinner 
                    ? 'bg-blue-600 border-blue-600' 
                    : habits.fasting.enabled 
                      ? 'border-gray-300' 
                      : 'border-gray-200'
                }`}>
                  {habits.fasting.enabled && habits.fasting.skipDinner && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`${habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'}`}>Skip Dinner</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipDinner}
                  disabled={!habits.fasting.enabled}
                  onChange={() => habits.fasting.enabled && toggleFastingOption('skipDinner')}
                />
              </label>
            </div>
          </div>

          {/* Sleep Schedule Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sleep Schedule</h3>
              <button 
                onClick={toggleSleepSchedule}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.sleepSchedule.enabled 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.sleepSchedule.enabled && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Wake-up Time</label>
                <input
                  type="time"
                  value={habits.sleepSchedule.wakeUpTime}
                  onChange={(e) => updateSleepTime('wakeUpTime', e.target.value)}
                  disabled={!habits.sleepSchedule.enabled}
                  className={`w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 ${
                    habits.sleepSchedule.enabled ? 'text-black' : 'text-gray-400'
                  }`}
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sleep Time</label>
                <input
                  type="time"
                  value={habits.sleepSchedule.sleepTime}
                  onChange={(e) => updateSleepTime('sleepTime', e.target.value)}
                  disabled={!habits.sleepSchedule.enabled}
                  className={`w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 ${
                    habits.sleepSchedule.enabled ? 'text-black' : 'text-gray-400'
                  }`}
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Exercise</h3>
              <button 
                onClick={toggleExercise}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.exercise.enabled 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.exercise.enabled && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{habits.exercise.daysPerWeek}</div>
              <div className="text-gray-600">Days a week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Human Animation */}
      <div className="flex-1 flex items-center -mt-96  justify-center lg:min-h-[400px]">
        <div className="w-full max-w-sm lg:max-w-xs">
          <Lottie 
            animationData={animationData}
            style={{ maxHeight: '300px', maxWidth: '100%' }}
            className="max-h-[300px] lg:max-h-[400px]"
            loop={true}
            autoplay={true}
          />
        </div>
      </div>
    </div>
  );

  const renderMealIntakeContent = () => (
    <div className="flex-1">
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
  );

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
          {selectedTab === "Habits" ? renderHabitsContent() : renderMealIntakeContent()}
        </div>
      </div>
    </div>
  );
} 