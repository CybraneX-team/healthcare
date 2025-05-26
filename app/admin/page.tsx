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

  const handleViewChange = (
    view: "dashboard" | "programs" | "modules" | "videos" | "users" | "settings"
  ) => {
    setActiveView(view);
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
      <AdminSidebar activeView={activeView} onViewChange={handleViewChange} />

      <div className="flex-1 ml-64">
        {activeView === "dashboard" && (
          <AdminDashboard onNavigate={handleViewChange} />
        )}

        {activeView === "programs" && (
          <ProgramsManager onProgramSelect={handleProgramSelect} />
        )}

        {activeView === "modules" && selectedProgram && (
          <ModulesManager
            programId={selectedProgram}
            onModuleSelect={handleModuleSelect}
            onBack={handleBackToPrograms}
          />
        )}

        {activeView === "videos" && selectedProgram && selectedModule && (
          <VideosManager
            programId={selectedProgram}
            moduleId={selectedModule}
            onBack={handleBackToModules}
          />
        )}

        {activeView === "users" && <UsersManager />}

        {activeView === "settings" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <p>Settings page content will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
