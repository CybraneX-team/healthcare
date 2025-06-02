"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Inputbox } from "@/components/ui/inputbox";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingAnimation } from "@/components/ui/loading-animation";
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
import { getCurrentUser, uploadUserDocument, updateUserProfile } from "@/utils/firebase";

type FileCategory = "labs" | "radiology" | "prescriptions";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  uploadProgress: number;
  previewUrl?: string;
  dateUploaded: Date;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<FileCategory>("labs");
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
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
    // Create a map to store the actual File objects by their generated ID
    const fileMap = new Map<string, File>();
    
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      // Store the actual File object in the map
      fileMap.set(id, file);
      
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        category: activeTab,
        uploadProgress: 0,
        dateUploaded: new Date()
      };
    });
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    
    // Upload files to Firebase Storage
    newFiles.forEach(uploadedFile => {
      const actualFile = fileMap.get(uploadedFile.id);
      if (actualFile) {
        simulateFileUpload(uploadedFile, actualFile);
      }
    });
  };
  
  const simulateFileUpload = async (file: UploadedFile, actualFile: File) => {
    try {
      // Get current user ID from auth
      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Update progress to show upload started
      setUploadingFiles(prev =>
        prev.map(f => f.id === file.id ? { ...f, uploadProgress: 10 } : f)
      );
      
      // Upload file to Firebase Storage
      const downloadURL = await uploadUserDocument(user.uid, actualFile, file.category);
      
      // Update progress to 100%
      setUploadingFiles(prev =>
        prev.map(f => f.id === file.id ? { ...f, uploadProgress: 100 } : f)
      );
      
      // Move file from uploading to uploaded with the download URL
      setUploadingFiles(prev => prev.filter(f => f.id !== file.id));
      setUploadedFiles(prev => [
        { ...file, uploadProgress: 100, previewUrl: downloadURL },
        ...prev
      ]);
      
      // Store file reference in Firestore (only metadata, not the actual file)
      await updateUserProfile(user.uid, {
        documents: {
          [file.category]: {
            [file.id]: {
              name: file.name,
              size: file.size,
              type: file.type,
              downloadURL,
              uploadedAt: new Date().toISOString()
            }
          }
        }
      });
      
    } catch (error) {
      console.error("File upload failed:", error);
      
      // Handle error by marking the file as failed
      setUploadingFiles(prev => prev.filter(f => f.id !== file.id));
      // You could add error handling UI here
    }
  };
  
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  const handleFinish = () => {
    // Show loading animation before redirecting
    setIsRedirecting(true);
    
    // Redirect to dashboard with a slight delay for animation
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
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
      {/* Loading animation for redirection */}
      {isRedirecting && (
        <LoadingAnimation
          title="Entering your dashboard"
          description="Preparing your personalized experience..."
          variant="blue"
        />
      )}
      
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
                          {formatFileSize(file.size)} • {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                        <Download className="h-4 w-4" />
                      </Button>
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
      
      <div className="flex justify-center mt-8">
        <Button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          disabled={isRedirecting}
        >
          <span>Submit</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}