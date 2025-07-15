'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Trash2,
  Download,
  ArrowRight,
  Eye,
  UploadCloud,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import {
  getCurrentUser,
  uploadUserDocument,
  updateUserProfile,
  getUserProfile,
  deleteUserFile,
} from '@/utils/firebase'
import { toast } from 'react-toastify'
import OverlayLoader from './OverlayLoader'

type FileCategory = 'labs' | 'radiology' | 'prescriptions'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  category: FileCategory
  uploadProgress: number
  previewUrl?: string
  dateUploaded: Date
  fullStorageName: string // ✅ Add this!
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<FileCategory>('labs')
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loadingMessage, setloadingMessage] = useState({
    message: '',
    active: false,
  })

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      const user = getCurrentUser()

      if (!user) return

      const profile = await getUserProfile(user.uid)
      if (!profile) return

      const categories: FileCategory[] = ['labs', 'radiology', 'prescriptions']
      const files: UploadedFile[] = []

      categories.forEach((category) => {
        // First, check top-level keys (like `radiology`, `labs`, etc.)
        if (profile[category]) {
          Object.entries(profile[category]).forEach(([id, fileData]: any) => {
            files.push({
              id,
              name: fileData.name,
              size: fileData.size,
              type: fileData.type,
              category: category as FileCategory,
              uploadProgress: 100,
              previewUrl: fileData.downloadURL,
              dateUploaded: new Date(fileData.uploadedAt),
              fullStorageName: fileData.fullStorageName || '',
            })
          })
        }

        // Second, check inside `documents` if it exists
        if (profile.documents && profile.documents[category]) {
          Object.entries(profile.documents[category]).forEach(
            ([id, fileData]: any) => {
              files.push({
                id,
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                category: category as FileCategory,
                uploadProgress: 100,
                previewUrl: fileData.downloadURL,
                dateUploaded: new Date(fileData.uploadedAt),
                fullStorageName: fileData.fullStorageName || '',
              })
            },
          )
        }
      })

      setUploadedFiles(files)
    }

    fetchUploadedFiles()
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleViewFile = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDownloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    setUploadingFiles(
      fileArray.map((file, i) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category: activeTab,
        uploadProgress: 0,
        dateUploaded: new Date(),
        fullStorageName: '',
      })),
    )

    try {
      const formData = new FormData()
      fileArray.forEach((file) => formData.append('files', file))

      // Optional loader here
      setloadingMessage({
        message: 'Uploading...',
        active: true,
      })

      await Promise.all(
        fileArray.map(async (file, i) => {
          const uploadedFile: UploadedFile = {
            id: `file-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            category: activeTab,
            uploadProgress: 0,
            dateUploaded: new Date(),
            fullStorageName: '', // Firebase will fill this later
          }

          await simulateFileUpload(uploadedFile, file)
        }),
      )

      toast.success('All files processed and saved.')
    } catch (error) {
      console.error('Batch upload failed', error)
      toast.error('Failed to process files.')
    } finally {
      setloadingMessage({ message: '', active: false })
    }
  }

  const simulateFileUpload = async (
    file: UploadedFile,
    actualFile: File,
    // parsedJson: String,
  ) => {
    try {
      // Get current user ID from auth
      const user = getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update progress to show upload started
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: 10 } : f)),
      )

      // Upload file to Firebase Storage
      const { downloadURL, fileName } = await uploadUserDocument(
        user.uid,
        actualFile,
        file.category,
      )

      // Update progress to 100%
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: 100 } : f)),
      )

      // Update progress to 100%
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: 100 } : f)),
      )

      // Move file from uploading to uploaded with the download URL
      setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id))
      setUploadedFiles((prev) => [
        { ...file, uploadProgress: 100, previewUrl: downloadURL },
        ...prev,
      ])

      // Store file reference in Firestore (only metadata, not the actual file)

      try {
        const formData = new FormData()
        formData.append('files', actualFile)



        await updateUserProfile(user.uid, {
          [file.category]: {
            [file.id]: {
              name: file.name,
              size: file.size,
              type: file.type,
              fullStorageName: fileName,
              downloadURL,
              uploadedAt: new Date().toISOString(),
            },
          }
        })
        setUploadingFiles([])
      } catch (err) {
        console.error('Groq extraction failed:', err)
      }
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('File upload failed:', error)

      // Handle error by marking the file as failed
      setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id))
      // You could add error handling UI here
    }
  }

  const activeTabFiles = uploadedFiles.filter(
    (file) => file.category === activeTab,
  )

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = uploadedFiles.find((file) => file.id === fileId)
      if (!fileToDelete) {
        console.warn('File not found in local state')
        return
      }
      const user = getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Ensure file has a valid fullStorageName
      if (!fileToDelete.fullStorageName) {
        console.error(
          'File is missing fullStorageName, cannot delete from storage.',
        )
        toast.error('File is missing storage reference.')
        return
      }

      // Use the correct full storage name (with timestamp prefix)
      await deleteUserFile(
        user.uid,
        fileToDelete.category,
        fileId,
        fileToDelete.fullStorageName,
      )

      // Remove from local state
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))

      toast.success('File deleted successfully!')
    } catch (error) {
      console.error('File deletion failed:', error)
      toast.error('Failed to delete file. Please try again.')
    }
  }



  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }


  const handleProcessUploadedFiles = async () => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    if(uploadedFiles.length <=  0){
      toast.info("please upload documents to process them")
      return 
    }
    setloadingMessage({ message: 'Processing your documents...', active: true })

    const idToken = await user.getIdToken();  

    const formData = new FormData()


    for (const file of activeTabFiles) {
      const res = await fetch(file.previewUrl!)
      const blob = await res.blob()
      formData.append('files', new File([blob], file.name, { type: file.type }))
    }

    const res = await fetch('/api/process-pdf', {
      method: 'POST',
       headers: {
      Authorization: `Bearer ${idToken}`,
      'x-user-id': user.uid, // ✅ Add this line
     },
      body: formData,
    })

    const { extractedJsonArray } = await res.json()

    await updateUserProfile(user.uid, {
      extractedLabData: extractedJsonArray, // or per category if needed
    })

    toast.success('Files processed successfully!')
  } catch (error) {
    console.error('Error processing uploaded files:', error)
    toast.error('Failed to process files.')
  } finally {
    setloadingMessage({ message: '', active: false })
  }
}

  return (
    <>
      {loadingMessage.active && (
        <OverlayLoader message={loadingMessage.message} />
      )}

      <div className="min-h-screen p-2 md:p-8 md:-mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]"
        >
          {/* Loading animation for redirection */}
          {isRedirecting && (
            <LoadingAnimation
              title="Entering your dashboard"
              description="Preparing your personalized experience..."
              variant="blue"
            />
          )}

          <div className="p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UploadCloud className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Document Upload Center
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Securely upload and organize your medical documents in one
                centralized location
              </motion.p>
            </div>

            {!isDragging &&
              uploadingFiles.length === 0 &&
              uploadedFiles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex justify-center mb-8"
                >
                  <Image
                    src="/medical-records.svg"
                    alt="Medical Records"
                    width={200}
                    height={200}
                    className="mx-auto opacity-80"
                  />
                </motion.div>
              )}

            {/* Tabs Section */}
            <div className="max-w-4xl mx-auto">
              <Tabs
                defaultValue="labs"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as FileCategory)}
              >
                <TabsList className="grid grid-cols-3 mb-8 bg-blue-50 w-full h-full rounded-2xl border border-blue-100">
                  <TabsTrigger
                    value="labs"
                    className="flex items-center gap-3 py-4 px-6 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Lab Results</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="radiology"
                    className="flex items-center gap-3 py-4 px-6 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Radiology</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="prescriptions"
                    className="flex items-center gap-3 py-4 px-6 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Prescriptions</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="labs">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8"
                  >
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl hover:border-blue-300 hover:bg-blue-100 transition-all duration-200">
                      <CardContent className="p-12 text-center">
                        <FileUpload
                          onChange={handleFileInputChange}
                          label="Upload Lab Results"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <p className="text-sm text-blue-600 mt-6 font-medium">
                          Supported formats: PDF, JPEG, PNG, DOC • Max size:
                          10MB per file
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="radiology">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8"
                  >
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl hover:border-blue-300 hover:bg-blue-100 transition-all duration-200">
                      <CardContent className="p-12 text-center">
                        <FileUpload
                          onChange={handleFileInputChange}
                          label="Upload Radiology Images"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.dicom,.dcm"
                        />
                        <p className="text-sm text-blue-600 mt-6 font-medium">
                          Supported formats: DICOM, PDF, JPEG, PNG • Max size:
                          10MB per file
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="prescriptions">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8"
                  >
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl hover:border-blue-300 hover:bg-blue-100 transition-all duration-200">
                      <CardContent className="p-12 text-center">
                        <FileUpload
                          onChange={handleFileInputChange}
                          label="Upload Prescriptions"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <p className="text-sm text-blue-600 mt-6 font-medium">
                          Supported formats: PDF, JPEG, PNG, DOC • Max size:
                          10MB per file
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Currently uploading files */}
              {uploadingFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <Card className="bg-blue-50 border border-blue-200 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                        <UploadCloud className="h-5 w-5" />
                        Uploading Files
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <AnimatePresence>
                          {uploadingFiles.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  <span className="font-medium text-gray-900 truncate max-w-[300px]">
                                    {file.name}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">
                                  {file.uploadProgress.toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={file.uploadProgress}
                                className="h-2 bg-blue-100"
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Uploaded files */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8"
                >
                  <Card className="bg-green-50 border border-green-200 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Uploaded Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {uploadedFiles
                            .filter((file) => file.category === activeTab)
                            .map((file, index) => {
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  whileHover={{ y: -2 }}
                                  className="bg-white border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                                        <FileText className="h-6 w-6 text-white" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 truncate max-w-[300px]">
                                          {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {formatFileSize(file.size)} •{' '}
                                          {new Date().toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                        onClick={() => {
                                          handleViewFile(
                                            file.previewUrl
                                              ? file.previewUrl
                                              : '',
                                          )
                                        }}
                                      >
                                        <Eye className="h-5 w-5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                        onClick={() => {
                                          handleDownloadFile(
                                            file?.previewUrl
                                              ? file?.previewUrl
                                              : '',
                                            file.name,
                                          )
                                        }}
                                      >
                                        <Download className="h-5 w-5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        onClick={() =>
                                          handleDeleteFile(file.id)
                                        }
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleProcessUploadedFiles}
                  className="flex items-center gap-3 bg-blue-500 
                  hover:bg-blue-600 text-white px-6 py-3 rounded-2xl 
                  text-md font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <span>Process Uploaded Files</span>
                  <UploadCloud className="h-5 w-5" />
                </Button>
              </div>
            

              {/* Submit Button */}

              {/*  this button  is commented out because file is getting upload already  */}

              {/* <div className="flex justify-center mt-12">
              <Button
                onClick={handleFinish}
                className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={isRedirecting}
              >
                <span>Complete Upload</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div> */}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
