"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoveUpRight,
  ChevronRight,
  ArrowRight,
  UploadCloud,
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
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

// Define animation variants for organ images
const mainOrganVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { 
      duration: 0.3,
      ease: "easeIn" 
    }
  }
};

const switcherVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
};

const switcherItemVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.2 }
  }
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
      {/* <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style> */}
      <div className="h-full">
        {/* <header className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-md p-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="white" />
                  <path
                    d="M4 12L12 16L20 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 16L12 20L20 16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg">ProHealth</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-600">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="text-gray-600">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-gray-100 w-full md:w-auto grid grid-cols-4 md:flex">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="courses"
                  className="data-[state=active]:bg-white"
                >
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="data-[state=active]:bg-white"
                >
                  Messages
                </TabsTrigger>
                <TabsTrigger
                  value="labs"
                  className="data-[state=active]:bg-white"
                >
                  Labs
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header> */}

        <main className="w-full h-full">
          {activeTab === "overview" ? (
            <div className="px-6 py-8 bg-gradient-to-b from-gray-200 to-white min-h-screen">
          
              {/* Digital Twin Navigation */}
              <div className="flex justify-center items-center w-full mb-12">
                <div className="flex bg-gray-100 rounded-full p-1 shadow-sm w-auto">
                  <Button
                    variant="ghost"
                    className="rounded-full px-8 py-4 text-gray-700 hover:bg-transparent hover:text-gray-900 font-medium"
                  >
                    Overall Progress
                  </Button>
                  <Button 
                    className="rounded-full px-8 py-4 bg-blue-500 text-white hover:bg-blue-600 font-medium"
                  >
                    Digital Twin
                  </Button>
                  <Button 
                    variant="ghost"
                    className="rounded-full px-8 py-4 text-gray-700 hover:bg-transparent hover:text-gray-900 font-medium"
                    >
                    Courses
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full px-8 py-4 text-gray-700 hover:bg-transparent hover:text-gray-900 font-medium"
                  >
                    Upload
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left column - Organ visualization with organ switcher */}
                <div className="lg:col-span-4 flex flex-col justify-center items-center mt-8">
                  {/* Dynamic organ visualization based on selected organ */}
                  {selectedOrgan === 'heart' && (
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
                  {selectedOrgan === 'lungs' && (
                    <div className="relative w-full max-w-lg mb-6">
                      <div className="relative h-[400px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-30 z-0"></div>
                        <LungsModel />
                      </div>
                    </div>
                  )}
                  {selectedOrgan === 'liver' && (
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
                  {selectedOrgan === 'brain' && (
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
                  <motion.div 
                    className="cursor-pointer w-full mt-20"
                    variants={switcherVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex justify-center items-center gap-8 w-full">
                      <div 
                        className={`organ-switcher-circle ${selectedOrgan === 'heart' ? 'active' : ''}`}
                        onClick={() => setSelectedOrgan('heart')}
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
                        className={`organ-switcher-circle  ${selectedOrgan === 'lungs' ? 'active' : ''}`}
                        onClick={() => setSelectedOrgan('lungs')}
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
                        className={`organ-switcher-circle  ${selectedOrgan === 'liver' ? 'active' : ''}`}
                        onClick={() => setSelectedOrgan('liver')}
                      >
                        <Image
                          src="/liver.png"
                          alt="Liver"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </div>
                      <div 
                        className={`organ-switcher-circle  ${selectedOrgan === 'brain' ? 'active' : ''}`}
                        onClick={() => setSelectedOrgan('brain')}
                      >
                        <Image
                          src="/heart.png"
                          alt="Brain"
                          width={50}
                          height={50}
                          className="object-contain"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
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
                  {/* <div className="flex justify-end mb-6">
                    <div className="inline-flex items-center gap-6 bg-white rounded-full py-2 px-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                              stroke="#FF0000"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 6V12L16 14"
                              stroke="#FF0000"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">
                          2314 Kcal burned
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        2314 Kcal Consumed
                      </div>
                    </div>
                  </div> */}

                  {/* Main Stats Grid */}


                  {/* Bottom Stats Grid */}
                  
                </div>
              </div>
            </div>
          ) : activeTab === "courses" ? (
            <CourseManagement />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
