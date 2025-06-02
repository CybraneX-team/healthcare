"use client";

import { useState, useEffect, useRef  } from "react";
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
import Course from "@/components/courseManage";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

// Import organ components
import HeartComponent from "@/components/heart-component";
import LiverComponent from "@/components/liver-component";
import LungsModel from "@/components/lungs-model";
import PancreasComponent from "@/components/pancreas-component";
import Upload from "@/components/upload";
import EnhancedAnatomy from "@/components/enhanced-anatomy";

import { PatientSection } from "./PatientSection";
import { LabsSection } from "./labSection";
import { ServicesProductsSection } from "./ServicesSection";
import { CombinedLabsSection } from "./Lab-Services";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Other organ components will be imported here as they are created

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
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const switcherVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.05,
    },
  },
};

const switcherItemVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState("heart");
  const weightTrendData = generateWeightTrendData();
  const [files, setFiles] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [extractedText, setExtractedText] = useState(''); // Optional: show result
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
  fileInputRef.current?.click();
};

const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setIsLoading(true); // Start loading
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract-text", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Failed to extract text");
      return;
    }

    const data = await res.json();
    console.log("Extracted Text:", data.extractedText);
    setExtractedText(data.extractedText);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setIsLoading(false); // End loading
  }
};

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "overview",
        "progress",
        "courses",
        "labs",
        "services",
        "admin",
        "upload",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

    useEffect(() => {
    const fetchRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        // User not logged in
        setIsAdmin(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []);
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

  // Function to handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without causing a page refresh
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.push(url.pathname + url.search);
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <style jsx>{organSwitcherStyle}</style>
      <style jsx global>{`
        body {
          overflow: ${activeTab === "overview" ? "hidden" : "auto"};
        }
      `}</style>
      <div className="h-full">
        <main className="w-full h-full">
          {/* Digital Twin Navigation - Moved outside conditionals so it stays in same position */}
          <div className="px-6 pt-8 pb-12">
            <div className="flex justify-center items-center w-full mb-6 relative">
              <div className="flex bg-gray-100 rounded-full p-1 overflow-hidden">
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === "progress"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  } text-sm`}
                  onClick={() => setActiveTab("progress")}
                >
                  Overall Progress
                </Button>
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === "overview"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  } text-sm`}
                  onClick={() => setActiveTab("overview")}
                >
                  Digital Twin
                </Button>
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === "courses"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  } text-sm`}
                  onClick={() => setActiveTab("courses")}
                >
                  Courses
                </Button>

                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === "labs"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  } text-sm`}
                  onClick={() => setActiveTab("labs")}
                >
                  Directories
                </Button>
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 py-2 ${
                    activeTab === "upload"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  } text-sm`}
                  onClick={() => setActiveTab("upload")}
                >
                  Upload
                </Button>
              </div>
               {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                className={`rounded-xl px-8 py-4 bg-blue-500 text-white hover:bg-blue-600 absolute left-10 font-medium`}
              >
                Admin
              </Button>
            </Link>
          )}
              {/* Profile dropdown - positioned absolutely to the right */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <ProfileDropdown />
              </div>
            </div>
          </div>
          {activeTab === "overview" ? (
            <div className="digital-twin px-6 py-0 bg-gradient-to-b from-gray-200 to-white min-h-screen overflow-hidden">
              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left column - Enhanced anatomy with organ switcher */}
                <div className="lg:col-span-4 flex flex-col justify-center items-center mt-8">
                  <EnhancedAnatomy 
                    selectedOrgan={selectedOrgan}
                    onOrganSelect={setSelectedOrgan}
                  />
                </div>

                {/* Right column - Dynamic content based on selected organ */}
                <div className="lg:col-span-8">
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
                  {selectedOrgan === 'brain' && <PancreasComponent />}
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
            <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
              <Course />
            </div>
          ) : activeTab === "labs" ? (
            // <LabsSection />
            <CombinedLabsSection />
          ) : activeTab === "upload" ? (
            <Upload />

          ) : activeTab === "progress" ? (
            <div className="px-6 bg-gradient-to-b from-gray-200 to-white min-h-screen">
              <div className="p-8 bg-white rounded-3xl shadow-sm mt-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Overall Progress
                </h2>
                <p className="text-gray-600">
                  Track your health metrics and overall progress here.
                </p>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Health Score</h3>
                  <Progress value={75} className="h-2 w-full" />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">0</span>
                    <span className="text-sm text-gray-500">100</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "admin" ? (
            <PatientSection />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gradient-to-b from-gray-200 to-white min-h-screen">
              <p className="text-gray-500">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
