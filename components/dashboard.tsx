"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoveUpRight,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CourseManagement } from "@/components/courseManage";
import Image from "next/image";

// Import organ components
import HeartComponent from "@/components/heart-component";
import LiverComponent from "@/components/liver-component";
import LungsModel from "@/components/lungs-model";
import { PatientSection } from "./PatientSection";
import { LabsSection } from "./labSection";
import { ServicesProductsSection } from "./ServicesSection";

// Define types for weight trend data
interface WeightTrendData {
  name: string;
  value: number;
  change: number;
}

// Function to generate weight trend data
const generateWeightTrendData = (): WeightTrendData[] => {
  // Sample data points for the weight trend
  return [
    { name: "Week 1", value: 5, change: +5 }, // Week 1, starting point
    { name: "Week 3", value: -8, change: -10 }, // Week 3, dip
    { name: "Week 4", value: 7, change: +5 }, // Week 4, peak
    { name: "Week 5", value: 3, change: -2 }, // Week 5, end point
  ];
};

// Function to generate SVG path from data points
const generatePath = (data: WeightTrendData[]): string => {
  // Map data to coordinates
  const points = data.map((point: WeightTrendData, index: number) => {
    // Calculate x position based on index
    const x = index * (270 / (data.length - 1));
    // Calculate y position (invert the value since SVG y-axis is inverted)
    const y = point.value;
    return { x, y };
  });

  // Generate the SVG path string
  let pathD = `M${points[0].x},${points[0].y}`;

  // Create a smooth curve through the points
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i].x;
    const y1 = points[i].y;
    const x2 = points[i + 1].x;
    const y2 = points[i + 1].y;

    // Control points for the curve
    const cpx1 = x1 + (x2 - x1) / 3;
    const cpy1 = y1;
    const cpx2 = x2 - (x2 - x1) / 3;
    const cpy2 = y2;

    pathD += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`;
  }

  return pathD;
};

// Function to create tooltip content
const createTooltipContent = (point: WeightTrendData): string => {
  const change = point.change > 0 ? `+${point.change}` : point.change;
  return `${point.name}: ${change} kg`;
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
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState("heart");
  const weightTrendData = generateWeightTrendData();

  // Restore selected organ from localStorage on component mount
  useEffect(() => {
    const savedOrgan = localStorage.getItem("selectedOrgan");
    if (savedOrgan) {
      setSelectedOrgan(savedOrgan);
    }
  }, []);

  // Save selected organ to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedOrgan", selectedOrgan);
  }, [selectedOrgan]);

  // Trigger animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // CSS for organ switcher circles
  const organSwitcherStyle = `
    .organ-switcher-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      border-bottom: 4px solid #E5E7EB;
      justify-content: center;
      // box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .organ-switcher-circle:hover {
      border-bottom: 2px solid #3b82f6;
      transition: border 0.1s ease-in-out;
    }

    // .organ-switcher-circle.active {
    //   border-bottom: 1px solid #3b82f6;
    //   transform: translateY(-5px);
    // }
    
    .organ-switcher-container {
      position: relative;
      z-index: 10;
      margin-top: -30px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }
  `;

  return (
    <div className="min-h-screen bg-gray-200">
      <style jsx>{organSwitcherStyle}</style>
      <div className="h-full">
        <main className="w-full h-full">
          <div className="px-6 py-8 bg-gradient-to-b from-gray-200 to-white min-h-screen">
            {/* Digital Twin Navigation - Moved outside of the conditional rendering to be visible on all tabs */}
            <div className="flex justify-center items-center w-full mb-12">
              <div className="flex bg-gray-100 rounded-full p-1 shadow-sm w-auto">
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-4 text-gray-700 hover:bg-transparent hover:text-gray-900 font-medium"
                >
                  Overall Progress
                </Button>
                <Button
                  className={`rounded-full px-4 py-4 ${
                    activeTab === "overview"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-transparent text-gray-700 hover:bg-transparent hover:text-gray-900"
                  } font-medium`}
                  onClick={() => setActiveTab("overview")}
                >
                  Digital Twin
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("courses")}
                  className={`rounded-full px-4 py-4 ${
                    activeTab === "courses"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-gray-700 hover:bg-transparent hover:text-gray-900"
                  } font-medium`}
                >
                  Courses
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("labs")}
                  className={`rounded-full px-8 py-4 ${
                    activeTab === "labs"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-gray-700 hover:bg-transparent hover:text-gray-900"
                  } font-medium`}
                >
                  Labs
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("services")}
                  className={`rounded-full px-8 py-4 ${
                    activeTab === "services"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-gray-700 hover:bg-transparent hover:text-gray-900"
                  } font-medium`}
                >
                  Services
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-4 text-gray-700 hover:bg-transparent hover:text-gray-900 font-medium"
                >
                  Upload
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setActiveTab("admin")}
                className={`rounded-xl px-8 py-4 ${
                  "bg-blue-500 text-white hover:bg-blue-600 absolute right-10"
                  // :"text-gray-700 hover:bg-transparent hover:text-gray-900"
                } font-medium`}
              >
                Admin
              </Button>
            </div>

            {/* Dynamic content based on activeTab */}
            {activeTab === "overview" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left column - Organ visualization with organ switcher */}
                <div className="lg:col-span-4 flex flex-col justify-center items-center mt-8">
                  {/* Dynamic organ visualization based on selected organ */}
                  {selectedOrgan === "heart" && (
                    <div className="relative w-full max-w-lg mb-6 mt-14">
                      <div className="relative h-[400px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-pink-50 to-transparent opacity-30 z-0"></div>
                        <Image
                          src="/heart.png"
                          alt="Heart 3D Model"
                          width={350}
                          height={350}
                          className="object-contain z-10"
                        />
                      </div>
                    </div>
                  )}
                  {selectedOrgan === "lungs" && (
                    <div className="relative w-full max-w-lg mb-6">
                      <div className="relative h-[400px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-30 z-0"></div>
                        <LungsModel />
                      </div>
                    </div>
                  )}
                  {selectedOrgan === "liver" && (
                    <div className="relative w-full max-w-lg mb-6 mt-[3.5rem]">
                      <div className="relative h-[400px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-yellow-50 to-transparent opacity-30 z-0"></div>
                        <Image
                          src="/liver.png" /* Replace with liver.png when available */
                          alt="Liver 3D Model"
                          width={350}
                          height={350}
                          className="object-contain z-10"
                        />
                      </div>
                    </div>
                  )}
                  {selectedOrgan === "brain" && (
                    <div className="relative w-full max-w-lg mb-6">
                      <div className="relative h-[400px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-purple-50 to-transparent opacity-30 z-0"></div>
                        <Image
                          src="/heart.png" /* Replace with brain.png when available */
                          alt="Brain 3D Model"
                          width={350}
                          height={350}
                          className="object-contain z-10"
                          style={{
                            filter:
                              "drop-shadow(0px 10px 15px rgba(128, 0, 255, 0.5))",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Organ Switcher Circles */}
                  <div className="cursor-pointer w-full mt-20">
                    <div className="flex justify-center items-center gap-8 w-full">
                      <div
                        className={`organ-switcher-circle ${
                          selectedOrgan === "heart" ? "active" : ""
                        }`}
                        onClick={() => setSelectedOrgan("heart")}
                      >
                        <Image
                          src="/heart.png"
                          alt="Heart"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                      <div
                        className={`organ-switcher-circle  ${
                          selectedOrgan === "lungs" ? "active" : ""
                        }`}
                        onClick={() => setSelectedOrgan("lungs")}
                      >
                        <Image
                          src="/lungs.png"
                          alt="Lungs"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                      <div
                        className={`organ-switcher-circle  ${
                          selectedOrgan === "liver" ? "active" : ""
                        }`}
                        onClick={() => setSelectedOrgan("liver")}
                      >
                        <Image
                          src="/liver.png" /* Replace with liver.png when available */
                          alt="Liver"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                      <div
                        className={`organ-switcher-circle  ${
                          selectedOrgan === "brain" ? "active" : ""
                        }`}
                        onClick={() => setSelectedOrgan("brain")}
                      >
                        <Image
                          src="/heart.png" /* Replace with brain.png when available */
                          alt="Brain"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Dynamic content based on selected organ */}
                <div className="lg:col-span-8 text-black">
                  {selectedOrgan === "heart" && <HeartComponent />}
                  {selectedOrgan === "lungs" && (
                    <div className="text-center p-8 bg-white rounded-3xl shadow-sm">
                      <h3 className="text-2xl font-semibold mb-4">
                        Lungs Component
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Lungs data will be displayed here. Create a separate
                        LiverComponent for detailed implementation.
                      </p>
                    </div>
                  )}
                  {selectedOrgan === "liver" && <LiverComponent />}
                  {selectedOrgan === "brain" && (
                    <div className="text-center p-8 bg-white rounded-3xl shadow-sm">
                      <h3 className="text-2xl font-semibold mb-4">
                        Brain Component
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Brain data will be displayed here. Create a separate
                        BrainComponent for detailed implementation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "courses" ? (
              <CourseManagement />
            ) : activeTab === "labs" ? (
              <LabsSection />
            ) : activeTab === "services" ? (
              <ServicesProductsSection />
            ) : activeTab === "admin" ? (
              <PatientSection />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  This section is under development
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
