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

export const HeartComponent = () => {
  const weightTrendData = generateWeightTrendData();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Organ Image is now handled in dashboard.tsx */}

      {/* Right column - Stats and cards */}
      <div className="lg:col-span-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
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

          {/* Alternative Card design (hidden) */}
          <div className="hidden md:col-span-7 h-full">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 text-black">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Weight Trend</h3>
                  <span className="text-xs text-gray-500">Monthly</span>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
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
          </div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-8 h-full text-black">
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
                    <div className="text-sm text-gray-500">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
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

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="text-xs pb-4 text-gray-600 mb-4">
                    Healthy weight for height
                    <br />
                    61.3 kg - 82.5 kg
                  </div>
                  {/* Weight Range Labels */}
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Below 61Kg</span>
                    <span>61 - 82Kg</span>
                    <span>83-99Kg</span>
                    <span>99Kg</span>
                  </div>
                  {/* BMI Scale */}
                  <div className="relative mb-2">
                    {/* Dynamic BMI Scale using CSS for better visual match */}
                    <div className="h-2 w-full rounded-full overflow-hidden flex">
                      {/* We'll use dynamic widths based on BMI ranges */}
                      <div className="h-full bg-[#2c3e50] w-[25%] transition-all duration-500"></div>
                      <div className="h-full bg-[#3498db] w-[25%] transition-all duration-500"></div>
                      <div className="h-full bg-[#e67e22] w-[25%] transition-all duration-500"></div>
                      <div className="h-full bg-[#e74c3c] w-[25%] transition-all duration-500"></div>
                    </div>
                    {/* Dynamic indicator position based on BMI value */}
                    <div
                      className="h-3 w-3 bg-white border border-gray-300 rounded-full absolute -top-0.5 transform -translate-x-1/2 transition-all duration-500 hover:scale-125"
                      style={{ left: `${calculateBmiPosition(20.5)}%` }} // Using the BMI value of 20.5 from the display
                    ></div>
                  </div>

                  {/* Status Labels */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Underweight</span>
                    <span className="text-blue-500 font-medium">You</span>
                    <span>Overweight</span>
                    <span>Obese Above</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-7">
            <Card className="shadow-sm border-0 bg-white rounded-3xl p-0 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                {/* VO2 Max Card */}
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
                      63
                    </div>
                    <div className="text-xl text-gray-600">Excellent</div>
                  </div>
                </div>

                {/* Sleep Card */}
                <div className="bg-gray-50 p-8 flex-1">
                  <h3 className="text-gray-800 text-xl font-semibold mb-2">
                    Total Sleep 7 Hours
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    40 Minutes
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

                        {/* Deep sleep - cyan */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset="230"
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
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-400 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Deep Sleep</span>
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

export default HeartComponent;
