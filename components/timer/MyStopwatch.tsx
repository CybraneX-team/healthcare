"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/utils/firebase";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins > 0 ? `${mins} min` : ""} ${secs} sec`.trim();
}

export default function MyStopwatch({ activity, goBack }: any) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (showCountdown) {
      setCountdown(3);
      let count = 3;
      const countdownInterval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setIsRunning(true);
          startTimeRef.current = Date.now();
        }
        setCountdown(count);
      }, 1000);
      setCountdown(count);
    }
  }, [showCountdown]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isRunning]);

  const handleStop = async () => {
    setIsRunning(false);
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          activities: arrayUnion({
            name: activity,
            duration: formatDuration(elapsed),
            completedAt: Timestamp.now(),
          }),
        });
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
    goBack();
  };

  const togglePause = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsed * 1000;
    }
  };

  const ms = Math.floor((elapsed % 1) * 1000);
  const totalSecs = Math.floor(elapsed);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const progress = (elapsed % 60) / 60 * 283;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-auto bg-[#f9fafb] flex flex-col items-center justify-center text-slate-800 p-4 relative"
    >
      <div className="absolute top-6 left-6">
        <button
          onClick={goBack}
          className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition shadow-sm"
        >
          ← Back
        </button>
      </div>

      <motion.div className="text-center z-10 flex flex-col items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{activity}</h2>

        {showCountdown ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`count-${countdown}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-6xl md:text-7xl font-extrabold text-blue-600"
            >
              {countdown === 0 ? "Start!" : countdown}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="relative w-[260px] h-[260px]">
            <svg className="absolute top-0 left-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="4" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - progress}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl md:text-4xl font-mono mb-1 text-gray-900">
                {`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
              </div>
              <div className="text-lg md:text-xl font-mono text-blue-500">
                .{String(ms).padStart(3, "0")}
              </div>
            </div>
          </div>
        )}

        {!showCountdown && (
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={togglePause}
              className="px-6 py-2 text-base rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
            >
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-2 text-base rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition"
            >
              Stop
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
