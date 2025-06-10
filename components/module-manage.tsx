"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ref, get, set, remove } from "firebase/database";
import { rtdb } from "@/utils/firebase"; // ensure this exports getDatabase(app)

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
import { updateDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import {  onValue } from "firebase/database";
import { db } from "@/utils/firebase";
import { getAuth } from "firebase/auth";

interface ModulesManagerProps {
  programId: string;
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export function ModulesManager({
  programId,
  onModuleSelect,
  onBack,
  setSidebarOpen,
}: ModulesManagerProps) {
  interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    progress: number;
    updatedAt?: string; // optional, sometimes missing
    videos?: any; // can be replaced with a proper Video type later
  }

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
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modulesRef = ref(
          rtdb,
          `courses/thrivemed/programs/${programId}/modules`
        );
        const snapshot = await get(modulesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          const loadedModules = Object.entries(data).map(([id, mod]: any) => ({
            id,
            ...mod,
          }));
          // console.log("loadedModules", loadedModules);
          setModules(loadedModules);
        } else {
          setModules([]); // No modules yet
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    if (programId) {
      fetchModules();
    }
  }, [programId]);

  const filteredModules = modules
    .filter(
      (module: Module) =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Module, b: Module) => a.order - b.order);

  // const handleAddModule = () => {
  //   const id = newModule.title.toLowerCase().replace(/\s+/g, "-");
  //   const newModuleData = {
  //     id,
  //     ...newModule,
  //     progress: 0,
  //     videos: 0,

  //   };

  //   setModules([...modules, newModuleData]);
  //   setNewModule({ title: "", description: "", order: modules.length + 1 });
  //   setIsAddDialogOpen(false);
  // };
async function recalculateAllProgramProgressForUser(programId: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  if (!userData) return;

  const prevCompletedVideos = userData.completedVideos || {};

  // 1️⃣ Fetch the latest modules from RTDB
  type ModuleData = { videos?: Record<string, any> };
  const programRef = ref(rtdb, `courses/thrivemed/programs/${programId}`);
  const programSnap = await new Promise<any>((resolve) => {
    onValue(programRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
  });
  const modules = (programSnap.modules || {}) as Record<string, ModuleData>;

  // 2️⃣ Recalculate progress using only existing modules
  const newModuleProgress: Record<string, number> = {};
  let totalVideosCount = 0;
  let totalCompletedCount = 0;

  for (const [modId, modData] of Object.entries(modules)) {
    const totalVideos = Object.keys(modData.videos || {}).length;
    const completedCount =
      (prevCompletedVideos[programId]?.[modId] || []).length;
    const progress =
      totalVideos === 0 ? 0 : Math.round((completedCount / totalVideos) * 100);

    newModuleProgress[modId] = progress;
    totalVideosCount += totalVideos;
    totalCompletedCount += completedCount;
  }

  // 3️⃣ Recalculate program progress
  const programProgressPercent =
    totalVideosCount === 0
      ? 0
      : Math.round((totalCompletedCount / totalVideosCount) * 100);

  // console.log(
  //   "Recalculated Progress:",
  //   `totalVideos=${totalVideosCount}`,
  //   `totalCompleted=${totalCompletedCount}`,
  //   `programProgress=${programProgressPercent}`
  // );

  // 4️⃣ Save recalculated data to Firestore
  await updateDoc(userRef, {
    [`programProgress.${programId}`]: programProgressPercent,
    [`moduleProgress.${programId}`]: newModuleProgress,
  });
}


  const handleAddModule = async () => {
    const id = newModule.title.toLowerCase().replace(/\s+/g, "-");
    const moduleData = {
      id,
      ...newModule,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Firebase Realtime DB POST
      const moduleRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${id}`
      );

      await set(moduleRef, moduleData);
      await recalculateAllProgramProgressForUser(programId);
      // Update local state
      setModules([...modules, moduleData]);

      // Reset form & close dialog
      setNewModule({ title: "", description: "", order: modules.length + 1 });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };





  const handleEditModule = async () => {
    if (!selectedModule) return;

    const updatedModule = {
      ...selectedModule,
      updatedAt: new Date().toISOString(),
    };

    try {
      const moduleRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${selectedModule.id}`
      );

      await set(moduleRef, updatedModule);

// 🔥 Initialize module progress for this program (to include new module)
      // await initializeModuleProgressForNewModules(programId);

      // 🔥 Recalculate program progress

      // Update local state
      // await recalculateAllProgramProgressForUser()
      setModules([...modules, updatedModule]);
      setNewModule({ title: "", description: "", order: modules.length + 1 });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error updating module in Firebase:", error);
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;

    try {
      const moduleRef = ref(
        rtdb,
        `courses/thrivemed/programs/${programId}/modules/${selectedModule.id}`
      );

      await remove(moduleRef);

      const updatedModules = modules.filter(
        (module: Module) => module.id !== selectedModule.id
      );
       await recalculateAllProgramProgressForUser(programId)

      setModules(updatedModules);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting module from Firebase:", error);
    }
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            className="p-2 rounded-full flex-shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {program.name}: Modules
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {program.description}
            </p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] mx-4">
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
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-black w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
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
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderKanban className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {module.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-500">
                  {module.videos && Object.keys(module.videos).length
                    ? Object.keys(module.videos).length
                    : " "}
                  {module.videos
                    ? Object.keys(module.videos).length === 1
                      ? "video"
                      : "videos"
                    : ""}
                </div>
                <Button
                  onClick={() => onModuleSelect(module.id)}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm w-full sm:w-auto"
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
        <DialogContent className="sm:max-w-[500px] mx-4">
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
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
              onClick={handleEditModule}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] mx-4">
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedModule?.title}"? This
              action cannot be undone and will remove all videos in this module.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteModule}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
