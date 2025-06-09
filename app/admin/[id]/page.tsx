"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, rtdb } from "@/utils/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import {
  ArrowLeft,
  FileText,
  Upload,
  UserIcon,
  X,
  CheckCircle,
  Calendar,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ref as dbRef, onValue } from "firebase/database";
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
  const [showSuccess, setShowSuccess] = useState(false);

  const defaultPrograms = [
    "thrivemed-apollo",
    "thrivemed-atlas",
    "thrivemed-hub",
  ];

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", id as string);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());
        else console.error("User not found");
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

      setUserData((prev: any) => ({
        ...prev,
        assignedPrograms: {
          ...(prev.assignedPrograms || {}),
          ...selectedPrograms.reduce(
            (acc, program) => ({ ...acc, [program]: true }),
            {}
          ),
        },
      }));

      setSelectedPrograms([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
    }, 100);
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center p-8 space-y-4 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin"></div>
          <p className="text-blue-700 font-semibold">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="fixed top-6 right-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-lg z-50 flex items-center space-x-3"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                Programs assigned successfully!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
          </Button>
          <h1 className="text-3xl font-bold text-blue-900 ml-4">
            Patient Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient Info */}
          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100">
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <UserIcon className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {userData.fullName}
                </h2>
                <p className="text-blue-600 font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-blue-900 font-medium">
                  {userData.phone || "No phone number"}
                </span>
              </div>
              {userData.dateOfBirth && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-900 font-medium">
                    {new Date(
                      userData.dateOfBirth.seconds * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Middle Column - Overview */}
          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-2">
            <h2 className="text-2xl font-bold text-blue-900 mb-8">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                  Primary Diagnosis
                </h3>
                <p className="text-xl font-semibold text-blue-900">
                  {userData.primaryDiagnosis || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                  Medications
                </h3>
                <p className="text-xl font-semibold text-blue-900">
                  {userData.medications || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                  Role
                </h3>
                <p className="text-xl font-semibold text-blue-900">
                  {userData.role || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                  Joined Date
                </h3>
                <p className="text-xl font-semibold text-blue-900">
                  {userData.createdAt
                    ? new Date(
                        userData.createdAt.seconds * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Programs Section */}
          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-blue-900">
                Assigned Programs
              </h2>
              <Button
                disabled={selectedPrograms.length === 0 || assigning}
                onClick={handleAssignPrograms}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {assigning ? "Assigning..." : "Assign Selected"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePrograms.map((program) => {
                const isDefault = defaultPrograms.includes(program);
                const isAlreadyAssigned =
                  !!userData.assignedPrograms?.[program];
                const isChecked = selectedPrograms.includes(program);

                return (
                  <label
                    key={program}
                    className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isDefault || isAlreadyAssigned
                        ? "bg-blue-50 border-blue-200"
                        : isChecked
                        ? "bg-blue-100 border-blue-300 shadow-md"
                        : "hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isDefault || isAlreadyAssigned || assigning}
                      checked={isDefault || isAlreadyAssigned || isChecked}
                      onChange={(e) =>
                        handleProgramSelect(program, e.target.checked)
                      }
                      className="h-5 w-5 text-blue-500 rounded border-blue-300 focus:ring-blue-500"
                    />
                    <span className="flex-1 font-medium text-blue-900">
                      {program}
                    </span>
                    {isDefault && (
                      <span className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full font-medium">
                        default
                      </span>
                    )}
                    {isAlreadyAssigned && !isDefault && (
                      <span className="text-xs px-3 py-1 bg-green-500 text-white rounded-full font-medium">
                        assigned
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Documents Section */}
          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
            <h2 className="text-2xl font-bold text-blue-900 mb-8">Documents</h2>

            <div className="mb-8">
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />

                <label
                  htmlFor="fileUpload"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    uploading ? "opacity-50" : "hover:opacity-80"
                  }`}
                >
                  <div className="  text-white mb-6">
                    <FileUpload
                      label="Upload Document"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="text-sm text-blue-600 mt-6 font-medium">
                      Supported formats: PDF, JPEG, PNG, DOC • Max size: 10MB
                      per file
                    </p>
                  </div>
                  <span className="text-blue-900 font-semibold text-lg mb-2">
                    {uploading ? "Uploading..." : "Upload Document"}
                  </span>
                  {/* <span className="text-blue-600">
                    PDF, DOC, DOCX, or images
                  </span> */}
                </label>

                {uploading && (
                  <div className="mt-6 w-full bg-blue-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {userData.documents &&
                Object.entries(userData.documents).map(
                  ([docId, docData]: any) => {
                    if (
                      typeof docData === "object" &&
                      docData.hasOwnProperty("downloadURL") === false
                    ) {
                      return Object.entries(docData).map(
                        ([nestedId, nestedDoc]: any) => (
                          <div
                            key={nestedId}
                            className="flex items-center justify-between p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 border border-blue-100"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <span className="font-semibold text-blue-900">
                                {nestedDoc.name || nestedId}
                              </span>
                            </div>

                            {nestedDoc.type === "application/pdf" ? (
                              <Button
                                variant="outline"
                                className="text-white bg-blue-500 hover:text-blue-700 hover:underline font-medium"
                                onClick={() =>
                                  handleViewPdf(nestedDoc.downloadURL)
                                }
                              >
                                View PDF
                              </Button>
                            ) : (
                              <a
                                href={nestedDoc.downloadURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-blue-500 hover:text-blue-700 hover:underline font-medium"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        )
                      );
                    } else {
                      return (
                        <div
                          key={docId}
                          className="flex items-center justify-between p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 border border-blue-100"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-semibold text-blue-900">
                              {docData.name || docId}
                            </span>
                          </div>

                          {docData.type === "application/pdf" ? (
                            <Button
                              variant="outline"
                              className="bg-blue-500 text-white hover:bg-blue-700 border-blue-200 rounded-xl"
                              onClick={() => handleViewPdf(docData.downloadURL)}
                            >
                              View PDF
                            </Button>
                          ) : (
                            <a
                              href={docData.downloadURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 hover:underline font-medium"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      );
                    }
                  }
                )}
            </div>
          </Card>

          {/* PDF Viewer */}
          <AnimatePresence>
            {selectedPdf && (
              <motion.div
                ref={viewerRef}
                className="lg:col-span-3 relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 600 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-6 right-6 z-50">
                  <button
                    onClick={() => setSelectedPdf(null)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-3 transition-colors duration-200 shadow-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={selectedPdf} />
                </Worker>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
