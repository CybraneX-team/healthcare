"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Inputbox } from "@/components/ui/inputbox";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  FileUp, 
  FilePlus, 
  FileText, 
  Trash2, 
  Download, 
  ArrowRight, 
  Eye,
  X,
  UploadCloud
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/utils/firebase";
import { doc, updateDoc } from "firebase/firestore";

type FileCategory = "labs" | "radiology" | "prescriptions";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  uploadProgress: number;
  previewUrl?: string;
  fileUrl?: string;
  dateUploaded: Date;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, uploadUserDocument, getUserFiles, getUserData, saveUserProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<FileCategory>("labs");
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Load any existing files from Firebase
  useEffect(() => {
    const loadExistingFiles = async () => {
      try {
        const files = await getUserFiles(activeTab);
        if (files && files.length > 0) {
          const formattedFiles: UploadedFile[] = files.map(file => ({
            id: file.id,
            name: file.filename || file.originalName,
            size: file.size || 0,
            type: file.contentType || "",
            category: file.category as FileCategory,
            uploadProgress: 100,
            fileUrl: file.fileUrl,
            dateUploaded: file.uploadedAt ? new Date(file.uploadedAt) : new Date()
          }));
          
          setUploadedFiles(formattedFiles);
        }
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };
    
    if (user) {
      loadExistingFiles();
    }
  }, [user, activeTab, getUserFiles]);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      category: activeTab,
      uploadProgress: 0,
      dateUploaded: new Date()
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    
    // Upload files to Firebase Storage
    Array.from(files).forEach((file, index) => {
      uploadFile(file, newFiles[index]);
    });
  };
  
  const uploadFile = async (file: File, fileInfo: UploadedFile) => {
    try {
      // Create a progress tracker
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) {
          clearInterval(interval);
          return;
        }
        
        setUploadingFiles(prev =>
          prev.map(f => f.id === fileInfo.id ? { ...f, uploadProgress: progress } : f)
        );
      }, 500);
      
      // Upload to Firebase Storage
      const fileUrl = await uploadUserDocument(file, fileInfo.category);
      
      clearInterval(interval);
      
      // Update the uploading files list
      setUploadingFiles(prev => prev.filter(f => f.id !== fileInfo.id));
      
      // Add to uploaded files list
      setUploadedFiles(prev => [
        { 
          ...fileInfo, 
          uploadProgress: 100,
          fileUrl
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Show error state for the file
      setUploadingFiles(prev => prev.filter(f => f.id !== fileInfo.id));
      
      // Could add error handling UI here
    }
  };
  
  const handleDeleteFile = (fileId: string) => {
    // In a real app, you would also delete from Firebase Storage
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  const handleFinish = async () => {
    try {
      if (user) {
        // Get the current user profile
        const userData = await getUserData();
        
        if (userData) {
          // Get reference to user document in Firestore
          const userRef = doc(db, "users", user.id);
          
          // Create a summary of uploaded documents
          const documentSummary = {};
          
          // Group files by category
          uploadedFiles.forEach(file => {
            if (!documentSummary[file.category]) {
              documentSummary[file.category] = [];
            }
            
            documentSummary[file.category].push({
              name: file.name,
              fileUrl: file.fileUrl,
              uploadDate: file.dateUploaded
            });
          });
          
          // Update the user document with file information
          await updateDoc(userRef, {
            documents: documentSummary,
            documentUploadComplete: true,
            updatedAt: new Date()
          });
        }
      }
      
      // Redirect to login page
      router.push("/auth/login?setup=complete");
    } catch (error) {
      console.error("Error saving document information:", error);
      // Still redirect to avoid user getting stuck
      router.push("/auth/login?setup=complete");
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  // Use the keyboard navigation hook
  useKeyboardNavigation(
    handleFinish, 
    [uploadedFiles]
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto rounded-2xl p-8"
    >
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-gray-800 mb-2"
        >
          Document Upload
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          Upload your medical documents to keep everything in one place
        </motion.p>
      </div>
      
      {!isDragging && uploadingFiles.length === 0 && uploadedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Image
            src="/medical-records.svg"
            alt="Medical Records"
            width={150}
            height={150}
            className="mx-auto"
          />
        </motion.div>
      )}
      
      <Tabs defaultValue="labs" value={activeTab} onValueChange={(value) => setActiveTab(value as FileCategory)}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="labs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Lab Results</span>
          </TabsTrigger>
          <TabsTrigger value="radiology" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Radiology</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Prescriptions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="labs">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <FileUpload
              onChange={handleFileInputChange}
              label="Upload Lab Results"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-xs text-gray-500 text-center mt-4">
              Supported formats: PDF, JPEG, PNG, DOC
            </p>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="radiology">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <FileUpload
              onChange={handleFileInputChange}
              label="Upload Radiology Images"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.dicom,.dcm"
            />
            <p className="text-xs text-gray-500 text-center mt-4">
              Supported formats: DICOM, PDF, JPEG, PNG
            </p>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <FileUpload
              onChange={handleFileInputChange}
              label="Upload Prescriptions"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-xs text-gray-500 text-center mt-4">
              Supported formats: PDF, JPEG, PNG, DOC
            </p>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Currently uploading files */}
      {uploadingFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">Uploading</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {uploadingFiles.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm truncate max-w-[240px]">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{file.uploadProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={file.uploadProgress} className="h-1" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      
      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {uploadedFiles
                .filter(file => file.category === activeTab)
                .map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[240px]">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.dateUploaded.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.fileUrl && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500"
                            onClick={() => window.open(file.fileUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.fileUrl!;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-between mt-8">
        {/* <Button 
          variant="outline" 
          onClick={() => router.push("/component-dashboard")}
          className="flex items-center gap-2"
        >
          <span>Skip for now</span>
        </Button> */}
        
        <Button 
          onClick={handleFinish}
          className="flex items-center gap-2 ml-20 bg-blue-600 hover:bg-blue-700"
        >
          <span>Complete Setup</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
} 