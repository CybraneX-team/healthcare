"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, rtdb } from "@/utils/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ref as dbRef, onValue } from "firebase/database";
import { X } from "lucide-react";
import "@react-pdf-viewer/core/lib/styles/index.css";

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);
const Worker = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Worker),
  { ssr: false }
);

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState<any | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
const [assigning, setAssigning] = useState(false);

  const defaultPrograms = ["thrivemed-apollo", "thrivemed-atlas", "thrivemed-hub"];

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", id as string);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());
        else console.error("User not found");
        console.log("cursor-pointer", userSnap.data())
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchPrograms = () => {
      const programsRef = dbRef(rtdb, "courses/thrivemed/programs");
      const unsubscribe = onValue(programsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAvailablePrograms(Object.keys(data));
        }
      });
      return () => unsubscribe();
    };

    fetchUserData();
    const unsubscribe = fetchPrograms();

    return () => unsubscribe && unsubscribe();
  }, [id]);

  const handleProgramSelect = (program: string, isChecked: boolean) => {
  setSelectedPrograms((prev) =>
    isChecked ? [...prev, program] : prev.filter((p) => p !== program)
  );
};

const handleAssignPrograms = async () => {
  if (!id || selectedPrograms.length === 0) return;
  setAssigning(true);
  try {
    const userRef = doc(db, "users", id as string);
    const updates = selectedPrograms.reduce(
      (acc, program) => ({ ...acc, [`assignedPrograms.${program}`]: true }),
      {}
    );
    await updateDoc(userRef, updates);

    // Update local state
    setUserData((prev: any) => ({
      ...prev,
      assignedPrograms: {
        ...(prev.assignedPrograms || {}),
        ...selectedPrograms.reduce((acc, program) => ({ ...acc, [program]: true }), {}),
      },
    }));

    // Clear selected programs
    setSelectedPrograms([]);

    // Success alert
    alert("Programs assigned successfully!");
  } catch (error) {
    console.error("Error assigning programs:", error);
    alert("Error assigning programs. Please try again.");
  } finally {
    setAssigning(false);
  }
};

  const handleFileUpload = async (file: File) => {
    if (!id) return;
    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `documents/${id}/labs/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", id as string);
      const docKey = file.name.split(".")[0];

      const updatedDocuments = {
        ...(userData.documents || {}),
        [docKey]: {
          downloadURL,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };

      await updateDoc(userRef, {
        documents: updatedDocuments,
      });

      setUserData((prev: any) => ({
        ...prev,
        documents: updatedDocuments,
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

    const handleViewPdf = (downloadURL: string) => {
    setSelectedPdf(downloadURL);
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Small delay to ensure the component has rendered
  };

  if (!userData) {
    return (
      <div className="p-8 text-gray-600 text-sm animate-pulse">
        Loading user details...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center px-4">
      <motion.div
        className="relative p-6 sm:p-8 w-full max-w-3xl space-y-6 rounded-xl shadow bg-gradient-to-b from-indigo-100 via-white to-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 rounded-b-lg shadow-md flex items-center gap-2 z-20">
          <Button
            variant="outline"
            className="text-indigo-600 hover:bg-indigo-50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* User Details */}
        <Card className="p-6 shadow-lg rounded-xl bg-white border border-indigo-100">
          <h1 className="text-xl font-bold text-indigo-700 mb-4">User Details</h1>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
            <div><span className="font-medium">Full Name:</span> {userData.fullName}</div>
            <div><span className="font-medium">Email:</span> {userData.email}</div>
            <div><span className="font-medium">Role:</span> {userData.role || "N/A"}</div>
            <div><span className="font-medium">Phone:</span> {userData.phone || "N/A"}</div>
            {userData.dateOfBirth && (
              <div>
                <span className="font-medium">Date of Birth:</span>{" "}
                {new Date(userData.dateOfBirth.seconds * 1000).toLocaleDateString()}
              </div>
            )}
            <div><span className="font-medium">Primary Diagnosis:</span> {userData.primaryDiagnosis || "N/A"}</div>
            <div><span className="font-medium">Medications:</span> {userData.medications || "N/A"}</div>
            <div>
              <span className="font-medium">Joined Date:</span>{" "}
              {userData.createdAt
                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </Card>

        {/* Assign Programs */}
{/* Assign Programs */}
<Card className="p-6 shadow-lg rounded-xl bg-white border border-indigo-100">
  <h2 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
    <span className="inline-block bg-indigo-100 text-indigo-600 rounded-full p-1.5">
      🎓
    </span>
    Assign Programs
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {availablePrograms.map((program) => {
      const isDefault = defaultPrograms.includes(program);
      const isAlreadyAssigned = !!userData.assignedPrograms?.[program];
      const isChecked = selectedPrograms.includes(program);

      return (
        <label
          key={program}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
            isDefault || isAlreadyAssigned
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:shadow-md transition cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            disabled={isDefault || isAlreadyAssigned || assigning}
            checked={isDefault || isAlreadyAssigned || isChecked}
            onChange={(e) => handleProgramSelect(program, e.target.checked)}
            className="accent-indigo-500"
          />
          <span>{program}</span>
          {isDefault && <span className="ml-auto text-xs italic">(default)</span>}
        </label>
      );
    })}
  </div>

  <div className="mt-4 flex justify-end">
    <Button
      disabled={selectedPrograms.length === 0 || assigning}
      onClick={handleAssignPrograms}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm"
    >
      {assigning ? "Assigning..." : "Assign Selected Programs"}
    </Button>
  </div>
</Card>



        {/* Upload Document */}
        <Card className="p-6 shadow-lg rounded-xl bg-white border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">Upload Document</h2>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-xs text-indigo-500 mt-2 animate-pulse">Uploading...</p>
          )}
        </Card>


  <Card className="p-6 shadow-lg rounded-xl bg-white border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">Documents</h2>
          {userData.documents && Object.entries(userData.documents).map(([docId, docData]: any) => {
            if (typeof docData === "object" && docData.hasOwnProperty("downloadURL") === false) {
              return Object.entries(docData).map(([nestedId, nestedDoc]: any) => (
                <div
                  key={nestedId}
                  className="flex items-center justify-between border rounded px-3 py-2 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <span className="text-sm text-gray-700">{nestedDoc.name || nestedId}</span>
                  {nestedDoc.type === "application/pdf" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-indigo-600 hover:bg-indigo-200 cursor-pointer"
                      onClick={() => handleViewPdf(nestedDoc.downloadURL)}
                    >
                      View PDF
                    </Button>
                  ) : (
                    <a
                      href={nestedDoc.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline cursor-pointer"
                    >
                      View File
                    </a>
                  )}
                </div>
              ));
            } else {
              return (
                <div
                  key={docId}
                  className="flex items-center justify-between border rounded px-3 py-2 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <span className="text-sm text-gray-700">{docData.name || docId}</span>
                  {docData.type === "application/pdf" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-indigo-600 hover:bg-indigo-200 cursor-pointer"
                      onClick={() => handleViewPdf(docData.downloadURL)}
                    >
                      View PDF
                    </Button>
                  ) : (
                    <a
                      href={docData.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline cursor-pointer"
                    >
                      View File
                    </a>
                  )}
                </div>
              );
            }
          })}
        </Card>
{selectedPdf && (
  <motion.div
    ref={viewerRef}
    className="relative w-full h-[600px] border rounded shadow-lg bg-white border-indigo-100 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    {/* Close (X) button */}
 <button
      onClick={() => setSelectedPdf(null)}
      className="absolute top-2 right-2 text-red-600  bg-red-200 hover:bg-red-300 rounded-full p-1.5 transition z-50"
    >
      <X className="w-5 h-5" /> {/* Bigger icon size */}
    </button>

    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer fileUrl={selectedPdf} />
    </Worker>
  </motion.div>
)}


      </motion.div>
    </div>
  );
}
