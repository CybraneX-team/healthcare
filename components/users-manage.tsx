"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersManagerProps {
  setSidebarOpen: (open: boolean) => void;
}

export function UsersManager({ setSidebarOpen }: UsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
  });

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "admin",
      joinedDate: "Jan 15, 2025",
      lastActive: "2 hours ago",
      avatar: "JD",
      avatarColor: "bg-blue-500",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "instructor",
      joinedDate: "Feb 20, 2025",
      lastActive: "1 day ago",
      avatar: "JS",
      avatarColor: "bg-purple-500",
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "student",
      joinedDate: "Mar 5, 2025",
      lastActive: "3 days ago",
      avatar: "RJ",
      avatarColor: "bg-green-500",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "student",
      joinedDate: "Apr 12, 2025",
      lastActive: "1 week ago",
      avatar: "ED",
      avatarColor: "bg-orange-500",
    },
    {
      id: "5",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "student",
      joinedDate: "May 1, 2025",
      lastActive: "just now",
      avatar: "MW",
      avatarColor: "bg-pink-500",
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const id = (users.length + 1).toString();
    const avatar = newUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUserData = {
      id,
      ...newUser,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastActive: "just now",
      avatar,
      avatarColor,
    };

    setUsers([...users, newUserData]);
    setNewUser({ name: "", email: "", role: "student" });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id ? { ...user, ...selectedUser } : user
    );

    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (user: any) => {
    setSelectedUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Users Management
        </h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] mx-4">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="rounded-md border border-gray-300 p-2 w-full sm:w-auto">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users list */}
      <Card className="shadow-sm border-0 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[200px]">
                  User
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[200px]">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[100px]">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[120px]">
                  Joined Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[120px]">
                  Last Active
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center text-sm font-medium flex-shrink-0`}
                      >
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900 truncate">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Shield
                        className={`h-4 w-4 flex-shrink-0 ${
                          user.role === "admin"
                            ? "text-red-500"
                            : user.role === "instructor"
                            ? "text-purple-500"
                            : "text-blue-500"
                        }`}
                      />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{user.joinedDate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    <span className="truncate">{user.lastActive}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  Role
                </label>
                <select
                  id="edit-role"
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
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
              className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
              onClick={handleEditUser}
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
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedUser?.name}"? This
              action cannot be undone.
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
              onClick={handleDeleteUser}
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
