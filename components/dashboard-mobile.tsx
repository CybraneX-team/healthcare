"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoveUpRight,
  ChevronRight,
  ArrowRight,
  UploadCloud,
  Heart,
  Activity,
  FileText,
  User,
  MoreHorizontal,
  ChevronUp,
  X,
  Home,
  CheckCircle,
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Course from "@/components/courseManage";
import { LabsSection } from "./labSection";
import { ServicesProductsSection } from "./ServicesSection";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import Neurology from "@/components/neurology";

// Import mobile-specific styles directly
import "@/styles/dashboard-mobile.css";

// Import organ components
import HeartComponent from "@/components/heart-component";
import LiverComponent from "@/components/liver-component";
import LungsModel from "@/components/lungs-model";
import { CombinedLabsSection } from "./Lab-Services";
import PancreasComponent from "./pancreas-component";
import Cardiology from "./cardiology";
import Kidney from "./kidney";

// Define types for weight trend data
interface WeightTrendData {
  name: string;
  value: number;
  change: number;
}

// Function to generate weight trend data
const generateWeightTrendData = (): WeightTrendData[] => {
  return [
    { name: "Week 1", value: 5, change: +5 },
    { name: "Week 3", value: -8, change: -10 },
    { name: "Week 4", value: 7, change: +5 },
    { name: "Week 5", value: 3, change: -2 },
  ];
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
  hidden: { opacity: 0 },
  visible: {
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

export default function DashboardMobile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrgan, setSelectedOrgan] = useState("heart");
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // Bottom navigation icons and handlers
  const bottomNavItems = [
    { id: "overview", icon: <Activity className="h-6 w-6" />, label: "Twin" },
    {
      id: "progress",
      icon: <Activity className="h-6 w-6" />,
      label: "Progress",
    },
    { id: "courses", icon: <FileText className="h-6 w-6" />, label: "Courses" },
    {
      id: "labs",
      icon: <FileText className="h-6 w-6" />,
      label: "Directories",
    },
    {
      id: "upload",
      icon: <UploadCloud className="h-6 w-6" />,
      label: "Upload",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Minimal header */}
      <header className="top-0 z-20 w-full px-5 py-4 flex items-center justify-between bg-transparent">
        <div className="flex items-center">
          <h1 className="font-bold text-lg text-gray-800">Healthcare App</h1>
        </div>
        <div className="flex items-center space-x-3">
          <ProfileDropdown />
        </div>
      </header>

      <main className="w-full h-full pt-3 xs-padding">
        {activeTab === "overview" ? (
          <div className="bg-gradient-to-b from-gray-100 to-white min-h-screen rounded-t-full">
            {/* Digital Twin Section */}
            <div>
              {/* Dynamic organ visualization based on selected organ */}
              <div className="flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {selectedOrgan === "heart" && (
                    <motion.div
                      key="heart"
                      className="relative w-full max-w-[250px] mb-2 mt-3"
                      variants={mainOrganVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="relative h-[220px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-pink-50 to-transparent opacity-30 z-0"></div>
                        <motion.div
                          initial={{ y: 10 }}
                          animate={{ y: [10, 0, 10] }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                          }}
                          className="scale-110"
                        >
                          <Image
                            src="/heart.png"
                            alt="Heart 3D Model"
                            width={200}
                            height={200}
                            className="object-contain z-10"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  {selectedOrgan === "lungs" && (
                    <motion.div
                      key="lungs"
                      className="relative w-full max-w-[250px] mb-2"
                      variants={mainOrganVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="relative h-[220px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-30 z-0"></div>
                        <LungsModel />
                      </div>
                    </motion.div>
                  )}
                  {selectedOrgan === "liver" && (
                    <motion.div
                      key="liver"
                      className="relative w-full max-w-[250px] mb-2 mt-2"
                      variants={mainOrganVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="relative h-[220px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-yellow-50 to-transparent opacity-30 z-0"></div>
                        <motion.div
                          initial={{ y: 10 }}
                          animate={{ y: [10, 0, 10] }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                          }}
                          className="scale-110"
                        >
                          <Image
                            src="/liver.png"
                            alt="Liver 3D Model"
                            width={200}
                            height={200}
                            className="object-contain z-10"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  {selectedOrgan === "brain" && (
                    <motion.div
                      key="brain"
                      className="relative w-full max-w-[250px] mb-2"
                      variants={mainOrganVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="relative h-[220px] w-full flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-purple-50 to-transparent opacity-30 z-0"></div>
                        <motion.div
                          initial={{ y: 10 }}
                          animate={{ y: [10, 0, 10] }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                          }}
                          className="scale-110"
                        >
                          <Image
                            src="/heart.png"
                            alt="Brain 3D Model"
                            width={200}
                            height={200}
                            className="object-contain z-10"
                            style={{
                              filter:
                                "drop-shadow(0px 10px 15px rgba(128, 0, 255, 0.5))",
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Horizontal Organ Switcher */}
              <motion.div
                className="cursor-pointer w-full px-2 mt-16"
                variants={switcherVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex justify-center items-center gap-6 overflow-x-auto py-1 pb-4 scrollbar-none">
                  {[
                    { id: "heart", image: "/heart.png", alt: "Heart" },
                    { id: "lungs", image: "/lungs.png", alt: "Lungs" },
                    { id: "liver", image: "/liver.png", alt: "Liver" },
                    { id: "brain", image: "/heart.png", alt: "Brain" },
                  ].map((organ) => (
                    <motion.div
                      key={organ.id}
                      className={`flex flex-col items-center organ-item ${
                        selectedOrgan === organ.id
                          ? "opacity-100"
                          : "opacity-70"
                      }`}
                      onClick={() => setSelectedOrgan(organ.id)}
                      variants={switcherItemVariants}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                          selectedOrgan === organ.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={organ.image}
                          alt={organ.alt}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <span
                        className={`text-xs font-medium mt-1 ${
                          selectedOrgan === organ.id
                            ? "text-blue-600"
                            : "text-gray-500"
                        } ${selectedOrgan === organ.id ? "tab-active" : ""}`}
                      >
                        {organ.alt}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Organ Content - Scrollable */}
              <div className="mt-1 pb-24 bg-white-50">
                {selectedOrgan === "heart" ? (
                  <div className="px-2">
                    <HeartComponent />
                  </div>
                ) : selectedOrgan === "lungs" ? (
                  <div className="px-3">
                    {/* <PancreasComponent /> */}
                    <Cardiology />
                  </div>
                ) : selectedOrgan === "liver" ? (
                  <div className="px-2">
                    {/* <LiverComponent /> */}
                    <Kidney />
                  </div>
                ) : selectedOrgan === "brain" ? (
                  // <div className="px-2">
                  //   <div className="text-center p-6 bg-white rounded-2xl shadow-sm mx-2 card-mobile">
                  //     <h3 className="text-xl font-semibold mb-3">
                  //       Brain Component
                  //     </h3>
                  //     <p className="text-gray-600 mb-6">
                  //       Brain data will be displayed here.
                  //     </p>
                  //   </div>
                  // </div>
                  <Neurology />
                ) : null}
              </div>
            </div>
          </div>
        ) : activeTab === "labs" ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            <CombinedLabsSection />
          </div>
        ) : activeTab === "courses" ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen">
            <Course />
          </div>
        ) : activeTab === "upload" ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen px-2">
            <div className="p-6 bg-white rounded-2xl shadow-sm mt-2 card-mobile">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <p className="text-gray-600 text-sm mb-4">
                Upload your medical documents and reports.
              </p>
              <div className="mt-4 flex justify-center">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Files</span>
                </Button>
              </div>
            </div>
          </div>
        ) : activeTab === "progress" ? (
          <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen px-2">
            <div className="p-6 bg-white rounded-2xl shadow-sm mt-2 card-mobile">
              <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
              <p className="text-gray-600 text-sm mb-4">
                Track your health metrics and progress.
              </p>

              <div className="mt-4">
                <h3 className="text-base font-medium mb-2">Health Score</h3>
                <Progress value={75} className="h-2 w-full" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">100</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl stat-card">
                  <h4 className="text-sm font-medium text-gray-600">
                    Weight Change
                  </h4>
                  <div className="mt-1 text-xl font-bold text-green-500">
                    -2.5 kg
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Last 30 days
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl stat-card">
                  <h4 className="text-sm font-medium text-gray-600">
                    Activity Level
                  </h4>
                  <div className="mt-1 text-xl font-bold">Medium</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    7,580 steps/day
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl stat-card">
                  <h4 className="text-sm font-medium text-gray-600">
                    Sleep Quality
                  </h4>
                  <div className="mt-1 text-xl font-bold">Good</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    7.2 hrs/night
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl stat-card">
                  <h4 className="text-sm font-medium text-gray-600">
                    Stress Level
                  </h4>
                  <div className="mt-1 text-xl font-bold text-yellow-500">
                    Moderate
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Based on HRV
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Bottom Navigation Bar - Floating pill-shaped dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-6">
        <div className="bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-3 px-2 bottom-nav-shadow safe-area-bottom mx-auto flex justify-around items-center max-w-md">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center px-3 ${
                activeTab === item.id ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div
                className={`p-1 ${
                  activeTab === item.id ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-medium mt-0.5 ${
                  activeTab === item.id ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-600 -mb-1.5"></div>
              )}
            </button>
          ))}

          <button
            className="flex flex-col items-center justify-center px-3 text-gray-500"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="p-1 text-gray-400">
              <User className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium mt-0.5 text-gray-500">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Profile Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-xl fixed bottom-0 left-0 right-0 max-h-[85vh] z-50">
            <Drawer.Title className="sr-only">User Profile</Drawer.Title>
            <div className="p-4 bg-white rounded-t-xl safe-area-bottom">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-5 drawer-pull" />

              <div className="flex items-center px-4">
                <Avatar className="h-14 w-14 border-2 border-gray-200">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h2 className="font-semibold text-xl">John Doe</h2>
                  <p className="text-gray-500 text-sm">john.doe@example.com</p>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto rounded-full p-2"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="mt-6 px-4 space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                >
                  <Activity className="mr-3 h-5 w-5" />
                  Health Records
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Documents
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-3 rounded-xl"
                >
                  <MoreHorizontal className="mr-3 h-5 w-5" />
                  Settings
                </Button>

                <div className="pt-2">
                  <Button variant="destructive" className="w-full mt-4">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
