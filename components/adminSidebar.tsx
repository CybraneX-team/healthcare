"use client";

import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  activeView:
    | "dashboard"
    | "programs"
    | "modules"
    | "videos"
    | "users"
    | "settings";
  onViewChange: (
    view: "dashboard" | "programs" | "modules" | "videos" | "users" | "settings"
  ) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AdminSidebar({
  activeView,
  onViewChange,
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "programs", label: "Programs", icon: BookOpen },
    { id: "modules", label: "Modules", icon: FolderKanban },
    { id: "videos", label: "Videos", icon: Video },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="default"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? (
            <X className="h-4 w-4 text-black" />
          ) : (
            <Menu className="h-4 w-4 text-black" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Thrivemed Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Course Management System</p>
        </div>

        <div className="flex-1 py-6">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={`w-full justify-start text-base font-medium ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                }`}
                onClick={() => onViewChange(item.id as any)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    activeView === item.id ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
