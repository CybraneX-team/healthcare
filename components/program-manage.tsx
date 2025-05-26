"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProgramsManagerProps {
  onProgramSelect: (programId: string) => void;
}

export function ProgramsManager({ onProgramSelect }: ProgramsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    status: "active",
  });

  // Mock data for programs
  const [programs, setPrograms] = useState([
    {
      id: "thrivemed-hub",
      name: "Thrivemed Hub",
      status: "active",
      description: "Personalized Health Roadmaps",
      progress: 33,
      modules: 12,
      createdAt: "May 15, 2025",
    },
    {
      id: "thrivemed-apollo",
      name: "Thrivemed Apollo",
      status: "completed",
      description: "Advanced Health Optimization",
      progress: 100,
      modules: 8,
      createdAt: "April 10, 2025",
    },
    {
      id: "thrivemed-atlas",
      name: "Thrivemed Atlas",
      status: "draft",
      description: "Comprehensive Body Mapping",
      progress: 0,
      modules: 5,
      createdAt: "May 20, 2025",
    },
  ]);

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProgram = () => {
    const id = newProgram.name.toLowerCase().replace(/\s+/g, "-");
    const newProgramData = {
      id,
      ...newProgram,
      progress: 0,
      modules: 0,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setPrograms([...programs, newProgramData]);
    setNewProgram({ name: "", description: "", status: "active" });
    setIsAddDialogOpen(false);
  };

  const handleEditProgram = () => {
    if (!selectedProgram) return;

    const updatedPrograms = programs.map((program) =>
      program.id === selectedProgram.id
        ? { ...program, ...selectedProgram }
        : program
    );

    setPrograms(updatedPrograms);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProgram = () => {
    if (!selectedProgram) return;

    const updatedPrograms = programs.filter(
      (program) => program.id !== selectedProgram.id
    );
    setPrograms(updatedPrograms);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (program: any) => {
    setSelectedProgram({ ...program });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (program: any) => {
    setSelectedProgram(program);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Programs Management
        </h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add New Program
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Program Name
                </label>
                <Input
                  id="name"
                  value={newProgram.name}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, name: e.target.value })
                  }
                  placeholder="Enter program name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newProgram.description}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter program description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full rounded-md border border-gray-300 p-2 bg-white"
                  value={newProgram.status}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleAddProgram}
              >
                Add Program
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search programs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="rounded-md border border-gray-300 p-2">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Programs list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card
            key={program.id}
            className="overflow-hidden rounded-xl shadow-sm border-0"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-500">{program.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onProgramSelect(program.id)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>View Modules</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(program)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(program)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e6e6e6"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={
                          program.status === "completed" ? "#10b981" : "#3b82f6"
                        }
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${program.progress * 2.51} 251`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  {program.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <span className="text-xs font-medium">
                      {program.progress}%
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {program.status === "active" && "Active"}
                    {program.status === "draft" && "Draft"}
                    {program.status === "completed" && "Completed"}
                  </span>
                  <div className="text-xs text-gray-500">
                    {program.modules} modules
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Created {program.createdAt}</span>
                </div>
                <Button
                  onClick={() => onProgramSelect(program.id)}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                >
                  Manage
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Program Name
                </label>
                <Input
                  id="edit-name"
                  value={selectedProgram.name}
                  onChange={(e) =>
                    setSelectedProgram({
                      ...selectedProgram,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={selectedProgram.description}
                  onChange={(e) =>
                    setSelectedProgram({
                      ...selectedProgram,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="edit-status"
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={selectedProgram.status}
                  onChange={(e) =>
                    setSelectedProgram({
                      ...selectedProgram,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleEditProgram}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedProgram?.name}"? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProgram}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
