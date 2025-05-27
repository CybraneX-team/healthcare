"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/adminSidebar";
import { AdminDashboard } from "@/components/adminDashboard";
import { ProgramsManager } from "@/components/program-manage";
import { ModulesManager } from "@/components/module-manage";
import { VideosManager } from "@/components/videos-manage";
import { UsersManager } from "@/components/users-manage";

export default function AdminPage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "programs" | "modules" | "videos" | "users" | "settings"
  >("dashboard");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
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

        {activeView === "videos" && selectedProgram && selectedModule && (
          <VideosManager
            programId={selectedProgram}
            moduleId={selectedModule}
            onBack={handleBackToModules}
            setSidebarOpen={setSidebarOpen}
          />
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
  );
}
