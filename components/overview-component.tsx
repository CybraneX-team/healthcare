"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { useState } from "react";
import FoodIntakeModal from "./FoodIntakeModal";

// Interface for medical data (only for dynamic data support)
interface Test {
  test_name: string;
  value?: number;
  unit?: string;
  reference_range?: {
    low: number;
    high: number;
    unit: string;
  };
  date?: string;
  sample_type?: string;
  notes?: string;
  metrics?: Record<string, any>;
}

interface System {
  name: string;
  tests: Test[];
}

interface PatientData {
  patient: {
    id: string;
    name: string;
    date_of_birth: string;
    sex: string;
    report_date: string;
    source_file: {
      filename: string;
      page: number;
      section_heading: string;
    };
  };
  systems: System[];
}

interface OverviewComponentProps {
  data?: PatientData;
}

// Function to generate weight trend data
const generateWeightTrendData = () => {
  // Sample data points for the weight trend
  return [
    { name: "Week 1", value: 5, change: +5 }, // Week 1, starting point
    { name: "Week 3", value: -8, change: -10 }, // Week 3, dip
    { name: "Week 4", value: 7, change: +5 }, // Week 4, peak
    { name: "Week 5", value: 3, change: -2 }, // Week 5, end point
  ];
};

// Function to calculate BMI indicator position
const calculateBmiPosition = (bmi: number): number => {
  // BMI ranges
  // Underweight: < 18.5
  // Normal: 18.5 - 24.9
  // Overweight: 25 - 29.9
  // Obese: >= 30

  if (bmi < 18.5) {
    // Position in the underweight range (0-25%)
    return (bmi / 18.5) * 25;
  } else if (bmi < 25) {
    // Position in the normal range (25-50%)
    return 25 + ((bmi - 18.5) / 6.5) * 25;
  } else if (bmi < 30) {
    // Position in the overweight range (50-75%)
    return 50 + ((bmi - 25) / 5) * 25;
  } else {
    // Position in the obese range (75-100%)
    // Cap at 100%
    return Math.min(75 + ((bmi - 30) / 10) * 25, 100);
  }
};

// Custom tooltip component for the weight trend chart
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      change: number;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const change =
      payload[0].payload.change > 0
        ? `+${payload[0].payload.change}`
        : payload[0].payload.change;
    return (
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <p className="text-xs font-medium text-blue-500">{`${label}: ${change} kg`}</p>
      </div>
    );
  }
  return null;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  },
  exit: {
    y: -15, 
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" }
  }
};

export const OverviewComponent = ({ data }: OverviewComponentProps) => {
  const weightTrendData = generateWeightTrendData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract dynamic data from JSON if available
  const cardiovascularSystem = data?.systems.find(system => system.name === "Cardiovascular");
  const neurologicalSystem = data?.systems.find(system => system.name === "Neurological / Autonomic");
  
  // Helper function to find a test by name
  const findTest = (testName: string, system?: System): Test | undefined => {
    return system?.tests.find(test => test.test_name === testName);
  };

  // Get dynamic VO2max if available, otherwise use original value
  const vo2maxTest = findTest("VO2max", cardiovascularSystem);
  const vo2max = vo2maxTest?.value || 63; // Original value: 63
  
  // Determine VO2max rating
  const getVO2MaxRating = (value: number): string => {
    if (value >= 60) return "Excellent";
    if (value >= 50) return "Good";
    if (value >= 40) return "Average";
    if (value >= 30) return "Below Average";
    return "Poor";
  };

  // Get dynamic sleep data if available
  const sleepTest = findTest("Sleep", neurologicalSystem);
  const sleepDuration = sleepTest?.metrics?.duration || "7:00"; // Default: 7 Hours
  const sleepMinutes = sleepTest?.metrics?.minutes || "40 Minutes"; // Default: 40 Minutes

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full lg:overflow-y-hidden overflow-y-auto"
    >
      {/* Food Intake Modal */}
      <FoodIntakeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Organ Image is now handled in dashboard.tsx */}

      {/* Right column - Stats and cards */}
      <div className="lg:col-span-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Weight Trend Card */}
          <motion.div variants={itemVariants} className="md:col-span-7 h-full">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Weight Trend</h3>
                  <span className="text-xs text-gray-500">Monthly</span>
                </div>
                <div className="h-[220px] w-full -ml-10">
                  <ResponsiveContainer width="110%" height="100%">
                    <LineChart
                      data={weightTrendData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="weightGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f3f4f6"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                      />
                      <YAxis
                        domain={[-10, 10]}
                        ticks={[-10, 0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={(value) =>
                          value > 0 ? `+${value}` : value
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{
                          r: 6,
                          strokeWidth: 2,
                          stroke: "white",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-full text-black">
                <div className="flex flex-col justify-between h-full">
                  {/* Total Weight */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">Total Weight</div>
                      <div className="text-3xl font-bold mt-1">71 Kg</div>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      Average
                    </div>
                    
                  </div>

                  {/* Strength Score */}
                  <div>
                    <div className="text-sm -mt-8 text-gray-500">
                      Strength Score 6
                    </div>
                  </div>

                  {/* Body Stats */}
                  <div className="bg-gray-100 p-4 rounded-3xl">
                    <div className="mb-2">
                      <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Healthy
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">
                          Total Body Fat
                        </div>
                        <div className="text-3xl font-bold mt-1">25%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Muscle Mass</div>
                        <div className="text-3xl font-bold mt-1">73%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Health Rating Card */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-8">
                <h3 className="font-semibold text-xl mb-6">Health Rating</h3>

                <div className="mb-4">
                  <div className="flex justify-between text-xl text-gray-500">
                    <span>BMI</span>
                  </div>
                  <span className="text-sm">Normal</span>
                  <div className="text-4xl font-bold">20.5</div>
                </div>
                
                <div className="mt-20">
                  <button 
                    className="w-[70%] bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-full transition-colors duration-300"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Upload Data
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-7">
            <Card className="shadow-sm border-0 bg-white rounded-3xl p-0 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                {/* VO2 Max Card - Dynamic data */}
                <div className="p-8 flex-1 relative">
                  <Image
                    src="/watch.png"
                    alt="Watch"
                    width={200}
                    height={200}
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-20 blur-sm"
                  />
                  <div className="relative z-10">
                    <h3 className="text-gray-800 text-xl font-semibold mb-2">
                      VO2 Max
                    </h3>
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      {vo2max}
                    </div>
                    <div className="text-xl text-gray-600">{getVO2MaxRating(vo2max)}</div>
                  </div>
                </div>

                {/* Sleep Card - Dynamic data */}
                <div className="bg-gray-50 p-8 flex-1">
                  <h3 className="text-gray-800 text-xl font-semibold mb-2">
                    Total Sleep {sleepDuration} Hours
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    {sleepMinutes}
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="relative h-28 w-28">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                        />

                        {/* Light sleep - blue */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#0066ff"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset="125"
                          transform="rotate(-90 50 50)"
                        />

                        {/* REM sleep - gray */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#c0c0c0"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset="200"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Light Sleep</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Rem Sleep</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewComponent;