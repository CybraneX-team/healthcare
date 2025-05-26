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
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  VideoIcon,
  Youtube,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideosManagerProps {
  programId: string;
  moduleId: string;
  onBack: () => void;
}

export function VideosManager({
  programId,
  moduleId,
  onBack,
}: VideosManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    youtubeId: "",
    duration: "00:00",
    order: 1,
  });

  // Mock program and module data
  const program = {
    id: programId,
    name: programId === "thrivemed-hub" ? "Thrivemed Hub" : "Thrivemed Apollo",
  };

  const module = {
    id: moduleId,
    title: getModuleTitle(moduleId),
  };

  function getModuleTitle(moduleId: string): string {
    const moduleTitles: Record<string, string> = {
      "mission-control": "Mission Control",
      "rapid-success": "Rapid Success Path",
      "may-religion": "May - Religion, Spirituality, Death and Longevity",
      "june-meaning": "June - Meaning",
      "june-alignment": "June - Alignment",
    };
    return moduleTitles[moduleId] || "Module";
  }

  // Mock data for videos
  const [videos, setVideos] = useState([
    {
      id: "welcome-video",
      title: "Welcome to Thrivemed Hub",
      description: "Introduction to the Thrivemed Hub platform and resources",
      youtubeId: "dQw4w9WgXcQ",
      duration: "05:12",
      completed: true,
      order: 1,
    },
    {
      id: "office-hours-video",
      title: "Open Office Hours Schedule",
      description:
        "Overview of the office hours schedule and how to participate",
      youtubeId: "9bZkp7q19f0",
      duration: "12:30",
      completed: true,
      order: 2,
    },
    {
      id: "session-recordings-video",
      title: "Open Session Recordings",
      description: "How to access and use the session recordings",
      youtubeId: "JGwWNGJdvx8",
      duration: "18:45",
      completed: false,
      order: 3,
    },
  ]);

  const filteredVideos = videos
    .filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleAddVideo = () => {
    const id = newVideo.title.toLowerCase().replace(/\s+/g, "-") + "-video";
    const newVideoData = {
      id,
      ...newVideo,
      completed: false,
    };

    setVideos([...videos, newVideoData]);
    setNewVideo({
      title: "",
      description: "",
      youtubeId: "",
      duration: "00:00",
      order: videos.length + 1,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditVideo = () => {
    if (!selectedVideo) return;

    const updatedVideos = videos.map((video) =>
      video.id === selectedVideo.id ? { ...video, ...selectedVideo } : video
    );

    setVideos(updatedVideos);
    setIsEditDialogOpen(false);
  };

  const handleDeleteVideo = () => {
    if (!selectedVideo) return;

    const updatedVideos = videos.filter(
      (video) => video.id !== selectedVideo.id
    );
    setVideos(updatedVideos);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (video: any) => {
    setSelectedVideo({ ...video });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (video: any) => {
    setSelectedVideo(video);
    setIsDeleteDialogOpen(true);
  };

  const toggleVideoCompletion = (videoId: string) => {
    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, completed: !video.completed } : video
    );
    setVideos(updatedVideos);
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
            {program.name}: {module.title}
          </h1>
          <p className="text-sm text-gray-500">Manage videos for this module</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Video Title
                </label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  placeholder="Enter video title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, description: e.target.value })
                  }
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="youtubeId" className="text-sm font-medium">
                  YouTube Video ID
                </label>
                <div className="flex gap-2">
                  <Input
                    id="youtubeId"
                    value={newVideo.youtubeId}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, youtubeId: e.target.value })
                    }
                    placeholder="e.g. dQw4w9WgXcQ"
                  />
                  <Button
                    variant="outline"
                    className="flex-shrink-0 text-white"
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter the YouTube video ID from the URL (e.g.,
                  youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-sm font-medium">
                    Duration
                  </label>
                  <Input
                    id="duration"
                    value={newVideo.duration}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, duration: e.target.value })
                    }
                    placeholder="MM:SS"
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
                    value={newVideo.order}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        order: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
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
                onClick={handleAddVideo}
              >
                Add Video
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
            placeholder="Search videos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Videos list */}
      <div className="space-y-4">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden rounded-xl shadow-sm border-0"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 cursor-pointer mt-1"
                    onClick={() => toggleVideoCompletion(video.id)}
                  >
                    {video.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {video.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {video.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{video.duration}</span>
                      <span className="mx-2">•</span>
                      <Youtube className="h-3 w-3 mr-1" />
                      <span className="font-mono">{video.youtubeId}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-[#0e244a]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(video)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleVideoCompletion(video.id)}
                    >
                      {video.completed ? (
                        <>
                          <Circle className="mr-2 h-4 w-4" />
                          <span>Mark as Incomplete</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Mark as Complete</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(video)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-end mt-4">
                <Button
                  variant="outline"
                  className="rounded-full text-white border-blue-500 bg-blue-500 hover:bg-blue-50 hover:text-black px-4 py-2 text-sm"
                  onClick={() =>
                    window.open(
                      `https://youtube.com/watch?v=${video.youtubeId}`,
                      "_blank"
                    )
                  }
                >
                  <Youtube className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <VideoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No videos found
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first video to this module
            </p>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Video
            </Button>
          </div>
        )}
      </div>

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Video Title
                </label>
                <Input
                  id="edit-title"
                  value={selectedVideo.title}
                  onChange={(e) =>
                    setSelectedVideo({
                      ...selectedVideo,
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
                  value={selectedVideo.description}
                  onChange={(e) =>
                    setSelectedVideo({
                      ...selectedVideo,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-youtubeId" className="text-sm font-medium">
                  YouTube Video ID
                </label>
                <div className="flex gap-2">
                  <Input
                    id="edit-youtubeId"
                    value={selectedVideo.youtubeId}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        youtubeId: e.target.value,
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    className="flex-shrink-0 text-white"
                    onClick={() =>
                      window.open(
                        `https://youtube.com/watch?v=${selectedVideo.youtubeId}`,
                        "_blank"
                      )
                    }
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="edit-duration"
                    className="text-sm font-medium"
                  >
                    Duration
                  </label>
                  <Input
                    id="edit-duration"
                    value={selectedVideo.duration}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        duration: e.target.value,
                      })
                    }
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
                    value={selectedVideo.order}
                    onChange={(e) =>
                      setSelectedVideo({
                        ...selectedVideo,
                        order: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-completed"
                  checked={selectedVideo.completed}
                  onChange={(e) =>
                    setSelectedVideo({
                      ...selectedVideo,
                      completed: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit-completed" className="text-sm">
                  Mark as completed
                </label>
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
              onClick={handleEditVideo}
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
            <DialogTitle>Delete Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedVideo?.title}"? This
              action cannot be undone.
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
            <Button variant="destructive" onClick={handleDeleteVideo}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
