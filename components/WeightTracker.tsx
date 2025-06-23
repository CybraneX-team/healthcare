"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { TrendingUp, Droplets, Zap, Beef, Target } from "lucide-react";

const generateWeightData = (period: "weekly" | "monthly" | "yearly") => {
  switch (period) {
    case "weekly":
      return [
        { name: "Mon", weight: 71.2, target: 70, date: "Dec 16" },
        { name: "Tue", weight: 71.0, target: 70, date: "Dec 17" },
        { name: "Wed", weight: 70.8, target: 70, date: "Dec 18" },
        { name: "Thu", weight: 70.5, target: 70, date: "Dec 19" },
        { name: "Fri", weight: 70.3, target: 70, date: "Dec 20" },
        { name: "Sat", weight: 70.1, target: 70, date: "Dec 21" },
        { name: "Sun", weight: 69.9, target: 70, date: "Dec 22" },
      ];
    case "monthly":
      return [
        { name: "Week 1", weight: 72.1, target: 70, date: "Nov W1" },
        { name: "Week 2", weight: 71.5, target: 70, date: "Nov W2" },
        { name: "Week 3", weight: 70.8, target: 70, date: "Nov W3" },
        { name: "Week 4", weight: 70.2, target: 70, date: "Nov W4" },
        { name: "Week 5", weight: 65.9, target: 70, date: "Dec W1" },
      ];
    case "yearly":
      return [
        { name: "Jan", weight: 74.2, target: 70, date: "2024" },
        { name: "Feb", weight: 73.8, target: 70, date: "2024" },
        { name: "Mar", weight: 73.1, target: 70, date: "2024" },
        { name: "Apr", weight: 72.5, target: 70, date: "2024" },
        { name: "May", weight: 71.9, target: 70, date: "2024" },
        { name: "Jun", weight: 71.2, target: 70, date: "2024" },
        { name: "Jul", weight: 70.8, target: 70, date: "2024" },
        { name: "Aug", weight: 70.4, target: 70, date: "2024" },
        { name: "Sep", weight: 70.1, target: 70, date: "2024" },
        { name: "Oct", weight: 69.8, target: 70, date: "2024" },
        { name: "Nov", weight: 69.9, target: 70, date: "2024" },
        { name: "Dec", weight: 70.0, target: 70, date: "2024" },
      ];
    default:
      return [];
  }
};

interface WeightTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

const WeightTooltip = ({ active, payload, label }: WeightTooltipProps) => {
  if (active && payload && payload.length) {
    const weightData = payload.find((p) => p.dataKey === "weight");
    const targetData = payload.find((p) => p.dataKey === "target");
    const weight = weightData?.value;
    const target = targetData?.value;
    const difference = weight && target ? (weight - target).toFixed(1) : "0";

    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-blue-600 font-medium">{`Weight: ${weight} kg`}</p>
          <p className="text-sm text-gray-500">{`Target: ${target} kg`}</p>
          <p
            className={`text-xs font-medium ${
              Number.parseFloat(difference) > 0
                ? "text-red-500"
                : Number.parseFloat(difference) < 0
                ? "text-green-500"
                : "text-gray-500"
            }`}
          >
            {Number.parseFloat(difference) > 0 ? `+${difference}` : difference}{" "}
            kg from target
          </p>
        </div>
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
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const WeightTrackingComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("weekly");
  const weightData = generateWeightData(selectedPeriod);

  const currentWeight = weightData[weightData.length - 1]?.weight || 65.9;
  const targetWeight = 70.0;
  const startWeight = weightData[0]?.weight || 71.2;
  const weightChange = currentWeight - startWeight;

  return (
    <div className="min-h-screen md:h-screen p-4 md:overflow-hidden overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full max-w-7xl mx-auto md:h-full min-h-screen md:min-h-0"
      >
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 md:grid-rows-6 gap-4 md:h-[calc(100vh-120px)] min-h-screen md:min-h-0">
          {/* Weight Chart - Main Container (Smaller) */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7 md:row-span-4 min-h-[400px] md:min-h-0"
          >
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Weight Progress
                    </h3>
                    <p className="text-sm text-gray-500">
                      Track your weight over time
                    </p>
                  </div>

                  {/* Period Selector */}
                  <div className="flex bg-gray-100 rounded-full p-1">
                    {(["weekly", "monthly", "yearly"] as const).map(
                      (period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedPeriod === period
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Chart Container */}
                <div className="flex-1 min-h-[300px] md:min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weightData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                      barCategoryGap="15%"
                      maxBarSize={40}
                    >
                      <defs>
                        <linearGradient
                          id="targetLineGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#dc2626"
                            stopOpacity={0.6}
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
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickFormatter={(value) => `${value}kg`}
                        width={45}
                      />
                      <Tooltip content={<WeightTooltip />} />
                      <Bar
                        dataKey="weight"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Weight"
                      />
                      <Bar
                        dataKey="target"
                        fill="url(#targetLineGradient)"
                        radius={[2, 2, 0, 0]}
                        name="Target"
                        opacity={0.3}
                        maxBarSize={8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Weight Card */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-5 row-span-2"
          >
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Weight
                  </h3>
                  <TrendingUp
                    className={`w-5 h-5 ${
                      weightChange < 0 ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {currentWeight} kg
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span
                      className={`text-sm font-medium ${
                        weightChange < 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {weightChange > 0 ? "+" : ""}
                      {weightChange.toFixed(1)} kg
                    </span>
                    <span className="text-sm text-gray-500">
                      this {selectedPeriod.slice(0, -2)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {targetWeight} kg
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            100 -
                              Math.abs(
                                (currentWeight - targetWeight) / targetWeight
                              ) *
                                100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BMI Card */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-5 row-span-2"
          >
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">BMI</h3>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    20.5
                  </div>
                  <div className="text-sm text-green-600 font-medium mb-4">
                    Normal Range
                  </div>
                </div>

                <div>
                  <div className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 h-2 rounded-full mb-2 relative">
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm absolute top-0 left-1/3 transform -translate-y-0.5 border-2 border-gray-300"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>18.5</span>
                    <span>25.0</span>
                    <span>30.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nutrition Cards Row */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 md:col-span-4 row-span-2 md:row-span-2 row-span-1"
          >
            <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-orange-900 mb-1">
                  Calories
                </h4>
                <div className="text-2xl font-bold text-orange-800">1,847</div>
                <p className="text-sm text-orange-600">of 2,200 kcal</p>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "84%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-12 md:col-span-4 row-span-2 md:row-span-2 row-span-1"
          >
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-1">
                  Water Intake
                </h4>
                <div className="text-2xl font-bold text-blue-800">1.8L</div>
                <p className="text-sm text-blue-600">of 2.5L</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-12 md:col-span-4 row-span-2 md:row-span-2 row-span-1"
          >
            <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-3">
                  <Beef className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-red-900 mb-1">
                  Protein Intake
                </h4>
                <div className="text-2xl font-bold text-red-800">95g</div>
                <p className="text-sm text-red-600">of 120g</p>
                <div className="w-full bg-red-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: "79%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeightTrackingComponent;
