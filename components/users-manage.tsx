"use client";

import { useEffect, useState } from "react";
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
import { collection, getDocs , doc, updateDoc, deleteDoc, addDoc, Timestamp   } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import { Overlay } from "vaul";
import OverlayLoader from "./OverlayLoader";

interface UsersManagerProps {
  setSidebarOpen: (open: boolean) => void;
}

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360); // full color wheel
  const saturation = 70 + Math.floor(Math.random() * 20); // 70-90% saturation for vivid colors
  const lightness = 50 + Math.floor(Math.random() * 10); // 50-60% lightness for richer colors

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}



export function UsersManager({ setSidebarOpen }: UsersManagerProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "patient",
    phone: "",
    dateOfBirth: "",
    primaryDiagnosis: "",
    medications: "",
    use2FA: false,
  });
  const [actionLoading, setActionLoading] = useState<{
  loading: boolean;
  message: string;
}>({ loading: false, message: "" });



  
  const router = useRouter();
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          const usersCollection = collection(db, "users");
          const snapshot = await getDocs(usersCollection);

          const usersData: any[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.fullName || "Unknown",
              email: data.email || "N/A",
              role: data.role || "student",
              joinedDate: new Date(data.createdAt?.seconds * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              phoneNumber: data.phone,
              avatar: data.displayName
                ? data.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                : "U",
              // ✅ Generate and store a fixed color for this user
              avatarColor: getRandomColor(),
              documents: data.documents || {},
              medications : data.medications,
              primaryDiagnosis : data.primaryDiagnosis,
              dateOfBirth : data.dateOfBirth
            };
          });

          setUsers(usersData);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUsers();
    }, []);



const filteredUsers = users.filter((user) => {
  const matchesSearch =
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesRole =
    selectedRole === "all" || user.role.toLowerCase() === selectedRole;

  return matchesSearch && matchesRole;
});


  // const handleAddUser = () => {
  //   const id = (users.length + 1).toString();
  //   const avatar = newUser.name
  //     .split(" ")
  //     .map((n) => n[0])
  //     .join("")
  //     .toUpperCase();
  //   const colors = [
  //     "bg-blue-500",
  //     "bg-purple-500",
  //     "bg-green-500",
  //     "bg-orange-500",
  //     "bg-pink-500",
  //   ];
  //   const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  //   const newUserData = {
  //     id,
  //     ...newUser,
  //     joinedDate: new Date().toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //     }),
  //     lastActive: "just now",
  //     avatar,
  //     avatarColor,
  //   };

  //   setUsers([...users, newUserData]);
  //   setNewUser({ name: "", email: "", role: "student" });
  //   setIsAddDialogOpen(false);
  // };

  // const handleEditUser = () => {
  //   if (!selectedUser) return;

  //   const updatedUsers = users.map((user) =>
  //     user.id === selectedUser.id ? { ...user, ...selectedUser } : user
  //   );

  //   setUsers(updatedUsers);
  //   setIsEditDialogOpen(false);
  // };


const handleAddUser = async () => {
  if (!newUser.name || !newUser.email) return;
  setIsAddDialogOpen(false);

  setActionLoading({ loading: true, message: "Adding user..." }); // 🔁 Start loader

  try {
    const usersCollection = collection(db, "users");

    const docRef = await addDoc(usersCollection, {
      fullName: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone || "",
      dateOfBirth: newUser.dateOfBirth || "",
      primaryDiagnosis: newUser.primaryDiagnosis || "",
      medications: newUser.medications || "",
      use2FA: newUser.use2FA || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      displayName: newUser.name,
    });

    const newUserData = {
      id: docRef.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      phoneNumber: newUser.phone || "",
      avatar: newUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      avatarColor: getRandomColor(),
      documents: {},
    };

    setUsers((prev) => [...prev, newUserData]);
    setNewUser({
      name: "",
      email: "",
      role: "student",
      phone: "",
      dateOfBirth: "",
      primaryDiagnosis: "",
      medications: "",
      use2FA: false,
    });
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    setActionLoading({ loading: false, message: "" }); // ✅ Reset loader
  }
};



const handleEditUser = async () => {
  if (!selectedUser) return;
  setIsEditDialogOpen(false);

  try {
    setActionLoading({ loading: true, message: "Editing user..." });

    const userRef = doc(db, "users", selectedUser.id);

    // Convert date string back to Timestamp (if valid)
    const parsedDOB = selectedUser.dateOfBirth
      ? new Date(selectedUser.dateOfBirth)
      : null;
    const isValidDate = parsedDOB instanceof Date && !isNaN(parsedDOB.valueOf());

    await updateDoc(userRef, {
      fullName: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      phone: selectedUser.phoneNumber,
      dateOfBirth: isValidDate ? Timestamp.fromDate(parsedDOB) : "",
      primaryDiagnosis: selectedUser.primaryDiagnosis || "",
      medications: selectedUser.medications || "",
      use2FA: selectedUser.use2FA || false,
      updatedAt: Timestamp.now(),
    });

    // Update local state
    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id ? { ...user, ...selectedUser } : user
    );

    setUsers(updatedUsers);
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    setActionLoading({ loading: false, message: "" });
  }
};



  // const handleDeleteUser = () => {
  //   if (!selectedUser) return;

  //   const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
  //   setUsers(updatedUsers);
  //   setIsDeleteDialogOpen(false);
  // };

  const handleDeleteUser = async () => {

  if (!selectedUser) return;

  try {
    // Reference to the document to delete
     setIsDeleteDialogOpen(false);

    setActionLoading({ loading: true, message: "Deleting User..." });
    const userRef = doc(db, "users", selectedUser.id);

    // Delete from Firestore
    await deleteDoc(userRef);

    // Update local state
    const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
    setUsers(updatedUsers);
  } catch (error) {
    console.error("Error deleting user:", error);
  }finally{
     setActionLoading({ loading: false, message: "" });
  }
};


const openEditDialog = (user: any) => {
  const timestamp = user.dateOfBirth;

  let formattedDOB = "";

  if (timestamp?.seconds) {
    // It's a Firestore Timestamp
    formattedDOB = new Date(timestamp.seconds * 1000).toISOString().split("T")[0];
  } else if (typeof timestamp === "string") {
    // It's already a date string
    formattedDOB = timestamp;
  }

  setSelectedUser({
    ...user,
    dateOfBirth: formattedDOB,
  });

  setIsEditDialogOpen(true);
};



  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
  <>
    {actionLoading.loading && (
       <OverlayLoader message={actionLoading.message}/>
  )}

    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Users Management
        </h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} >
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] mx-4 my-5 max-h-[90vh] overflow-y-auto">
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
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <Input
              id="phone"
              type="text"
              maxLength={10}
              value={newUser.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10); // remove non-digits and trim to 10
                setNewUser({ ...newUser, phone: value });
              }}
            />

          </div>

          <div className="space-y-2">
            <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
            <Input
              id="dob"
              type="date"
              value={newUser.dateOfBirth}
              onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="diagnosis" className="text-sm font-medium">Primary Diagnosis</label>
            <Input
              id="diagnosis"
              type="text"
              value={newUser.primaryDiagnosis}
              onChange={(e) => setNewUser({ ...newUser, primaryDiagnosis: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="medications" className="text-sm font-medium">Medications</label>
            <Input
              id="medications"
              type="text"
              value={newUser.medications}
              onChange={(e) => setNewUser({ ...newUser, medications: e.target.value })}
            />
          </div>

          <div className="space-y-2 flex items-center">
            <input
              type="checkbox"
              id="use2fa"
              checked={newUser.use2FA}
              onChange={(e) => setNewUser({ ...newUser, use2FA: e.target.checked })}
            />
            <label htmlFor="use2fa" className="ml-2 text-sm font-medium">
              Enable Two-Factor Authentication
            </label>
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
        <select
        className="rounded-md border border-gray-300 p-2 w-full sm:w-auto"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="instructor">Instructor</option>
        <option value="patient">Patient</option>
      </select>

      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <span className="text-gray-500">Loading users...</span>
        </div>
      ) : (
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
                  Phone Number
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
                    style={{ backgroundColor: user.avatarColor }}   
                    className={`w-8 h-8 rounded-full capitalize text-white flex items-center justify-center text-sm font-medium flex-shrink-0`}
                      >
                        {user.name ? user.name.substring(0,1) || "U" :  "U"}
                      </div>
                      <span 
                    onClick={() => router.push(`/admin/${user.id}`)}
                      className="font-medium text-gray-900 truncate hover:underline hover:cursor-pointer">
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
                    <span className="truncate">{user.phoneNumber}</span>
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
      </Card> )
      }

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[500px] mx-4 my-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Full Name</label>
              <Input id="edit-name" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium">Email Address</label>
              <Input id="edit-email" type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm font-medium">Role</label>
              <select id="edit-role" className="w-full rounded-md border border-gray-300 p-2" value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>

         <div className="space-y-2">
          <label htmlFor="edit-phone" className="text-sm font-medium">Phone Number</label>
          <Input
            id="edit-phone"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={selectedUser.phoneNumber || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setSelectedUser({ ...selectedUser, phoneNumber: value });
            }}
          />
        </div>


            <div className="space-y-2">
              <label htmlFor="edit-dob" className="text-sm font-medium">Date of Birth</label>
              <Input id="edit-dob" type="date" value={selectedUser.dateOfBirth || ""} onChange={(e) => setSelectedUser({ ...selectedUser, dateOfBirth: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-diagnosis" className="text-sm font-medium">Primary Diagnosis</label>
              <Input id="edit-diagnosis" type="text" value={selectedUser.primaryDiagnosis || ""} onChange={(e) => setSelectedUser({ ...selectedUser, primaryDiagnosis: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-medications" className="text-sm font-medium">Medications</label>
              <Input id="edit-medications" type="text" value={selectedUser.medications || ""} onChange={(e) => setSelectedUser({ ...selectedUser, medications: e.target.value })} />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="edit-2fa" checked={selectedUser.use2FA || false} onChange={(e) => setSelectedUser({ ...selectedUser, use2FA: e.target.checked })} />
              <label htmlFor="edit-2fa" className="text-sm font-medium">Enable Two-Factor Authentication</label>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto" onClick={handleEditUser}>
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

      {selectedUserForDetails && (
  <Dialog open={true} onOpenChange={() => setSelectedUserForDetails(null)}>
    <DialogContent className="sm:max-w-[600px] mx-4">
      <DialogHeader>
        <DialogTitle>User Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <strong>Full Name:</strong> {selectedUserForDetails.name}
        </div>
        <div>
          <strong>Email:</strong> {selectedUserForDetails.email}
        </div>
        <div>
          <strong>Role:</strong> {selectedUserForDetails.role}
        </div>
        <div>
          <strong>Phone:</strong> {selectedUserForDetails.phoneNumber}
        </div>
        <div>
          <strong>Joined Date:</strong> {selectedUserForDetails.joinedDate}
        </div>

        <div>
          <strong>Documents:</strong>
          {selectedUserForDetails.documents && Object.keys(selectedUserForDetails.documents).length > 0 ? (
            <ul className="space-y-2 mt-2">
              {Object.entries(selectedUserForDetails.documents).map(([docName, docData]: any) => (
                <li key={docName}>
                  <div className="flex items-center justify-between">
                    <span>{docName}</span>
                    <Button
                      variant="outline"
                      onClick={() => window.open(docData.downloadURL, "_blank")}
                    >
                      View PDF
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No documents uploaded.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setSelectedUserForDetails(null)}
        >
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}

    </div>

  </>

)}
