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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Video,
  FolderKanban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModulesManagerProps {
  programId: string;
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
}

export function ModulesManager({
  programId,
  onModuleSelect,
  onBack,
}: ModulesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // Mock program data
  const program = {
    id: programId,
    name: programId === "thrivemed-hub" ? "Thrivemed Hub" : "Thrivemed Apollo",
    description: "Personalized Health Roadmaps",
  };

  // Mock data for modules
  const [modules, setModules] = useState([
    {
      id: "mission-control",
      title: "Mission Control",
      description: "Introduction to the program and overview of resources",
      progress: 33,
      videos: 3,
      order: 1,
    },
    {
      id: "rapid-success",
      title: "Rapid Success Path",
      description: "Quick start guide to achieving initial results",
      progress: 0,
      videos: 2,
      order: 2,
    },
    {
      id: "may-religion",
      title: "May - Religion, Spirituality, Death and Longevity",
      description: "Exploring the connections between spirituality and health",
      progress: 25,
      videos: 4,
      order: 3,
    },
    {
      id: "june-meaning",
      title: "June - Meaning",
      description: "Finding purpose and meaning in health journey",
      progress: 0,
      videos: 3,
      order: 4,
    },
    {
      id: "june-alignment",
      title: "June - Alignment",
      description: "Aligning your actions with your health goals",
      progress: 0,
      videos: 0,
      order: 5,
    },
  ]);

  const filteredModules = modules
    .filter(
      (module) =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleAddModule = () => {
    const id = newModule.title.toLowerCase().replace(/\s+/g, "-");
    const newModuleData = {
      id,
      ...newModule,
      progress: 0,
      videos: 0,
    };

    setModules([...modules, newModuleData]);
    setNewModule({ title: "", description: "", order: modules.length + 1 });
    setIsAddDialogOpen(false);
  };

  const handleEditModule = () => {
    if (!selectedModule) return;

    const updatedModules = modules.map((module) =>
      module.id === selectedModule.id
        ? { ...module, ...selectedModule }
        : module
    );

    setModules(updatedModules);
    setIsEditDialogOpen(false);
  };

  const handleDeleteModule = () => {
    if (!selectedModule) return;

    const updatedModules = modules.filter(
      (module) => module.id !== selectedModule.id
    );
    setModules(updatedModules);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (module: any) => {
    setSelectedModule({ ...module });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (module: any) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4 p-2 rounded-full"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {program.name}: Modules
          </h1>
          <p className="text-sm text-gray-500">{program.description}</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Module Title
                </label>
                <Input
                  id="title"
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                  placeholder="Enter module title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newModule.description}
                  onChange={(e) =>
                    setNewModule({ ...newModule, description: e.target.value })
                  }
                  placeholder="Enter module description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="order" className="text-sm font-medium">
                  Order
                </label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={newModule.order}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      order: Number.parseInt(e.target.value),
                    })
                  }
                />
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
                onClick={handleAddModule}
              >
                Add Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search modules..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Modules list */}
      <div className="space-y-4">
        {filteredModules.map((module) => (
          <Card
            key={module.id}
            className="overflow-hidden rounded-xl shadow-sm border-0"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {module.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-[#152644]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onModuleSelect(module.id)}>
                      <Video className="mr-2 h-4 w-4" />
                      <span>Manage Videos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(module)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(module)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">
                    {module.progress}%
                  </span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {module.videos} {module.videos === 1 ? "video" : "videos"}
                </div>
                <Button
                  onClick={() => onModuleSelect(module.id)}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                >
                  Manage Videos
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          {selectedModule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Module Title
                </label>
                <Input
                  id="edit-title"
                  value={selectedModule.title}
                  onChange={(e) =>
                    setSelectedModule({
                      ...selectedModule,
                      title: e.target.value,
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
                  value={selectedModule.description}
                  onChange={(e) =>
                    setSelectedModule({
                      ...selectedModule,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-order" className="text-sm font-medium">
                  Order
                </label>
                <Input
                  id="edit-order"
                  type="number"
                  min="1"
                  value={selectedModule.order}
                  onChange={(e) =>
                    setSelectedModule({
                      ...selectedModule,
                      order: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleEditModule}
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
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedModule?.title}"? This
              action cannot be undone and will remove all videos in this module.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
