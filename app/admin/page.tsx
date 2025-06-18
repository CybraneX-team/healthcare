"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/adminSidebar";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/adminDashboard";
import { ProgramsManager } from "@/components/program-manage";
import { ModulesManager } from "@/components/module-manage";
import { VideosManager } from "@/components/videos-manage";
import { UsersManager } from "@/components/users-manage";
import { auth, getUserProfile } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProgramProvider, useProgramContext } from "@/hooks/useProgressData";
import { FolderKanban, Video } from "lucide-react";   //  ←  NEW
import { Button } from "@/components/ui/button";


export default function AdminPage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "programs" | "modules" | "videos" | "users" | "settings"
  >("dashboard");
  const { programData, userCompletedVideos } = useProgramContext();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  

  const router = useRouter(); 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.role === "admin" ) {
          setIsAdmin(true);
        } else {
          toast.error("Access Denied: Admins only.");
          router.replace("/dashboard");
        }
      } else {
        toast.error("You must be logged in to access the admin page.");
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

 
  
  const handleViewChange = (
    view: "dashboard" | "programs" | "modules" | "videos" | "users" | "settings"
  ) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    setActiveView("modules");
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setActiveView("videos");
  };

  const handleBackToPrograms = () => {
    setActiveView("programs");
    setSelectedProgram(null);
    setSelectedModule(null);
  };

  const handleBackToModules = () => {
    setActiveView("modules");
    setSelectedModule(null);
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If not admin, this never renders because of redirect above
  if (!isAdmin) return null;

  return (
    <ProgramProvider programId={selectedProgram || "dewdw"} activeView={activeView} >
    <div className="min-h-screen bg-white flex">
      <AdminSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {activeView === "dashboard" && (
          <AdminDashboard
            onNavigate={handleViewChange}
            setSidebarOpen={setSidebarOpen}
          />
        )}

        {activeView === "programs" && (
          <ProgramsManager
            onProgramSelect={handleProgramSelect}
            setSidebarOpen={setSidebarOpen}
          />
        )}

        {activeView === "modules" && selectedProgram && (
          <ModulesManager
            programId={selectedProgram}
            onModuleSelect={handleModuleSelect}
            onBack={handleBackToPrograms}
            setSidebarOpen={setSidebarOpen}
          />
        )}


{/* fallback when no programme has been chosen */}
        {activeView === "modules" && !selectedProgram && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <FolderKanban className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-700">
              No programme selected
            </h2>
            <p className="text-gray-500 max-w-sm">
              Choose a programme in the <span className="font-medium">Programs</span> section
              before managing its modules.
            </p>
            <Button
              onClick={() => handleViewChange("programs")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Programs
            </Button>
          </div>
        )}

        {activeView === "videos" && selectedProgram && selectedModule && (
          <VideosManager
            programId={selectedProgram}
            moduleId={selectedModule}
            onBack={handleBackToModules}
            setSidebarOpen={setSidebarOpen}
          />
        )}

        {activeView === "videos" && (!selectedProgram || !selectedModule) && (
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <Video className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-700">
          No module selected
        </h2>
        <p className="text-gray-500 max-w-sm">
          Choose a programme&nbsp;and module in the{" "}
          <span className="font-medium">Modules</span> section
          before managing its videos.
        </p>
        <Button
          onClick={() => handleViewChange("modules")}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Go to Modules
        </Button>
      </div>
    )}
        {activeView === "users" && (
          <UsersManager setSidebarOpen={setSidebarOpen} />
        )}

        {activeView === "settings" && (
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Settings</h1>
            <p className="text-black">Settings page content will go here.</p>
          </div>
        )}
      </div>
    </div>
      </ProgramProvider>
  );
}
