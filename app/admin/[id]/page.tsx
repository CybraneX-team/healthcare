'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, rtdb } from '@/utils/firebase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { deleteObject } from 'firebase/storage'
import {
  ArrowLeft,
  FileText,
  Upload,
  UserIcon,
  X,
  CheckCircle,
  Calendar,
  Eye,
  Download,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ref as dbRef, onValue } from 'firebase/database'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { toast } from 'react-toastify'
// import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer'
import { ClinicalSummaryPdf } from '@/components/ClinicalReport'
import { SalesScriptPdf } from '@/components/SalesScriptPdf'
import OverlayLoader from '@/components/OverlayLoader'

const Viewer = dynamic(
  () => import('@react-pdf-viewer/core').then((mod) => mod.Viewer),
  { ssr: false },
)
const Worker = dynamic(
  () => import('@react-pdf-viewer/core').then((mod) => mod.Worker),
  { ssr: false },
)

export default function UserDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const [userData, setUserData] = useState<any | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const viewerRef = useRef<HTMLDivElement>(null)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pdfLoading, setPdfLoading] = useState<{
    active: boolean
    message: string
  }>({
    active: false,
    message: '',
  })
  const [processingText, setprocessingText] = useState<{
    active: boolean
    message: string
  }>({
    active: false,
    message: '',
  })
  const [downloadingFile, setDownloadingFile] = useState(false)

  const [showLabData, setShowLabData] = useState(false)

  const defaultPrograms = [
    'thrivemed-apollo',
    'thrivemed-atlas',
    'thrivemed-hub',
  ]

  useEffect(() => {
    if (!id) return

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', id as string)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserData(userSnap.data())
        } else console.error('User not found')
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const fetchPrograms = () => {
      const programsRef = dbRef(rtdb, 'courses/thrivemed/programs')
      const unsubscribe = onValue(programsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setAvailablePrograms(Object.keys(data))
        }
      })
      return () => unsubscribe()
    }

    fetchUserData()
    const unsubscribe = fetchPrograms()

    return () => unsubscribe && unsubscribe()
  }, [id])

  const handleProgramSelect = (program: string, isChecked: boolean) => {
    setSelectedPrograms((prev) =>
      isChecked ? [...prev, program] : prev.filter((p) => p !== program),
    )
  }

  const handleAssignPrograms = async () => {
    if (!id || selectedPrograms.length === 0) return
    setAssigning(true)
    try {
      const userRef = doc(db, 'users', id as string)
      const updates = selectedPrograms.reduce(
        (acc, program) => ({ ...acc, [`assignedPrograms.${program}`]: true }),
        {},
      )
      await updateDoc(userRef, updates)

      setUserData((prev: any) => ({
        ...prev,
        assignedPrograms: {
          ...(prev.assignedPrograms || {}),
          ...selectedPrograms.reduce(
            (acc, program) => ({ ...acc, [program]: true }),
            {},
          ),
        },
      }))

      setSelectedPrograms([])
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error assigning programs:', error)
      alert('Error assigning programs. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  const handleMultipleFileUpload = async (files: FileList) => {
    if (!id) return

    const fileArray = Array.from(files)
    if (!fileArray.length) return

    setprocessingText({
      active: true,
      message: 'Uploading and extracting all PDFs...',
    })
    setUploading(true)

    try {
      // Upload all files to Firebase Storage
      const storage = getStorage()
      const uploadedMetadata = await Promise.all(
        fileArray.map(async (file) => {
          const timestamp = Date.now()
          const category = 'labs'
          const fullStorageName = `${timestamp}-${file.name}`
          const storageRef = ref(
            storage,
            `documents/${id}/${category}/${fullStorageName}`,
          )
          await uploadBytes(storageRef, file)
          const downloadURL = await getDownloadURL(storageRef)
          return {
            file,
            fullStorageName,
            downloadURL,
            docKey: file.name.split('.')[0],
            category,
          }
        }),
      )

      // Send all files to Groq API
      const formData = new FormData()
      fileArray.forEach((file) => formData.append('files', file))

      const res = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      const { extractedJsonArray: rawReply } = await res.json()

      // ✅ Fix: extract JSON inside code block if needed
      let cleanedReply = rawReply
      if (typeof rawReply === 'string') {
        const match = rawReply.match(/```json\s*([\s\S]*?)```/i)
        cleanedReply = match ? match[1] : rawReply
      }

      let extractedJsonArray
      try {
        extractedJsonArray = JSON.parse(cleanedReply)
      } catch (err) {
        console.error('❌ Failed to parse Groq JSON:', cleanedReply)
        toast.error('Failed to parse extracted data.')
        extractedJsonArray = []
      }

      if (!extractedJsonArray)
        throw new Error('Groq extraction failed or returned nothing.')

      // Construct Firestore updates
      const userRef = doc(db, 'users', id as string)
      const updatedDocs: any = {}
      const structuredExtractedData: Record<string, any> = {}

      uploadedMetadata.forEach((meta, index) => {
        const extracted = extractedJsonArray?.[index] || ''
        updatedDocs[meta.docKey] = {
          name: meta.file.name,
          size: meta.file.size,
          type: meta.file.type,
          uploadedAt: new Date().toISOString(),
          downloadURL: meta.downloadURL,
          fullStorageName: meta.fullStorageName,
        }
        structuredExtractedData[meta.docKey] = extracted
      })

      await updateDoc(userRef, {
        labs: {
          ...(userData?.labs || {}),
          ...updatedDocs,
        },
        extractedLabData: JSON.stringify(structuredExtractedData, null, 2),
      })

      setUserData((prev: any) => ({
        ...prev,
        labs: {
          ...(prev?.labs || {}),
          ...updatedDocs,
        },
        extractedLabData: JSON.stringify(structuredExtractedData, null, 2),
      }))

      toast.success('All files uploaded and processed!')
    } catch (err) {
      console.error('❌ Upload failed:', err)
      toast.error('Upload or extraction failed.')
    } finally {
      setUploading(false)
      setprocessingText({ active: false, message: '' })
    }
  }

  const handleViewPdf = (downloadURL: string) => {
    setSelectedPdf(downloadURL)
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleDeleteFile = async (
    category: string,
    fileId: string,
    fullStorageName: string,
  ) => {
    try {
      if (!id) return

      const userRef = doc(db, 'users', id as string)

      // Remove file metadata from Firestore
      const updatedDocs = { ...(userData?.[category] || {}) }
      delete updatedDocs[fileId]

      await updateDoc(userRef, {
        [category]: updatedDocs,
      })

      // Delete from Firebase Storage
      const storage = getStorage()
      const fileRef = ref(
        storage,
        `documents/${id}/${category}/${fullStorageName}`,
      )
      await deleteObject(fileRef) // Ensure this works depending on your Firebase version

      // Update local state
      setUserData((prev: any) => ({
        ...prev,
        [category]: updatedDocs,
      }))

      toast.success('File deleted successfully.')
    } catch (error) {
      console.error('File deletion failed:', error)
      toast.error('Failed to delete file.')
    }
  }

  // const handleDownloadClinicalSummary = async () => {
  //   if (!userData?.extractedLabData) return toast.error("No extracted lab data found.");

  //   try {
  //     const res = await fetch("/api/generate-summary", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         extractedText: userData.extractedLabData,
  //         type: "summary",
  //       }),
  //     });

  //     const data = await res.json();

  //     const blob = await pdf(<ClinicalSummaryPdf summary={data.result} />).toBlob();
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "Clinical_Summary.pdf";
  //     a.click();
  //     URL.revokeObjectURL(url);

  //     toast.success("Clinical Summary PDF downloaded!");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to download clinical summary.");
  //   }
  // };

  const handleDownloadClinicalSummary = async () => {
    if (!userData?.extractedLabData)
      return toast.error('No extracted lab data found.')
    setPdfLoading({
      active: true,
      message: 'Generating Clinical Summary PDF...',
    })

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        body: JSON.stringify({
          extractedText: userData.extractedLabData,
          type: 'summary',
        }),
      })

      const data = await res.json()

      const blob = await pdf(
        <ClinicalSummaryPdf summary={data.result} />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Clinical_Summary.pdf'
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Clinical Summary PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to download clinical summary.')
    } finally {
      setPdfLoading({ active: false, message: '' })
    }
  }

  // const handleDownloadSalesScript = async () => {
  //   if (!userData?.extractedLabData) return toast.error("No extracted lab data found.");

  //   try {
  //     const res = await fetch("/api/generate-summary", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         extractedText: userData.extractedLabData,
  //         type: "sales",
  //       }),
  //     });

  //     const data = await res.json();

  //     const blob = await pdf(<SalesScriptPdf script={data.result} />).toBlob();
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "Sales_Script.pdf";
  //     a.click();
  //     URL.revokeObjectURL(url);

  //     toast.success("Sales Script PDF downloaded!");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to download sales script.");
  //   }
  // };

  const handleDownloadSalesScript = async () => {
    if (!userData?.extractedLabData)
      return toast.error('No extracted lab data found.')
    setPdfLoading({ active: true, message: 'Generating Sales Script PDF...' })

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        body: JSON.stringify({
          extractedText: userData.extractedLabData,
          type: 'sales',
        }),
      })

      const data = await res.json()

      const blob = await pdf(<SalesScriptPdf script={data.result} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Sales_Script.pdf'
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Sales Script PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to download sales script.')
    } finally {
      setPdfLoading({ active: false, message: '' })
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center p-8 space-y-4 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin"></div>
          <p className="text-blue-700 font-semibold">Loading user details...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {(pdfLoading.active || processingText.active || downloadingFile) && (
        <OverlayLoader
          message={
            pdfLoading.active
              ? pdfLoading.message
              : processingText.active
                ? processingText.message
                : 'Downloading file...'
          }
        />
      )}

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
                    {userData.phone || 'No phone number'}
                  </span>
                </div>
                {userData.dateOfBirth && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-900 font-medium">
                      {new Date(
                        userData.dateOfBirth.seconds * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Middle Column - Overview */}
            <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-2">
              <h2 className="text-2xl font-bold text-blue-900 mb-8">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                    Primary Diagnosis
                  </h3>
                  <p className="text-xl font-semibold text-blue-900">
                    {userData.primaryDiagnosis || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                    Medications
                  </h3>
                  <p className="text-xl font-semibold text-blue-900">
                    {userData.medications || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                    Role
                  </h3>
                  <p className="text-xl font-semibold text-blue-900">
                    {userData.role || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                    Joined Date
                  </h3>
                  <p className="text-xl font-semibold text-blue-900">
                    {userData.createdAt
                      ? new Date(
                          userData.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowLabData((prev) => !prev)}
              >
                <h2 className="text-2xl font-bold text-blue-900">
                  Extracted Lab Data
                </h2>
                <button className="text-blue-600 font-semibold hover:underline focus:outline-none">
                  {showLabData ? 'Hide' : 'Show'}
                </button>
              </div>

              {showLabData && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                  {(() => {
                    let parsed = {}
                    try {
                      if (typeof userData?.extractedLabData === 'string') {
                        const cleaned = userData.extractedLabData
                          .replace(/^```json/, '')
                          .replace(/```$/, '')
                          .trim()
                        parsed = JSON.parse(cleaned || '{}')
                      } else if (
                        typeof userData?.extractedLabData === 'object'
                      ) {
                        parsed = userData.extractedLabData
                      }

                      return Object.entries(parsed).map(
                        ([sectionName, sectionData]: [string, any]) => (
                          <div
                            key={sectionName}
                            className="bg-white p-6 rounded-xl shadow border min-w-[250px] w-full"
                          >
                            <h3 className="text-blue-700 font-bold text-md mb-2 capitalize">
                              {sectionName.replace(/_/g, ' ')}
                            </h3>
                            <ul className="list-disc list-inside text-blue-900 space-y-1">
                              {Object.entries(sectionData || {}).map(
                                ([label, value]) => (
                                  <li key={label}>
                                    <span className="font-medium capitalize">
                                      {label.replace(/_/g, ' ')}:
                                    </span>{' '}
                                    {value === null || value === '' ? (
                                      'N/A'
                                    ) : typeof value === 'object' &&
                                      !Array.isArray(value) ? (
                                      <ul className="ml-4 list-disc text-sm">
                                        {Object.entries(value).map(([k, v]) => (
                                          <li key={k}>
                                            <span className="font-medium capitalize">
                                              {k.replace(/_/g, ' ')}:
                                            </span>{' '}
                                            {v === null || v === ''
                                              ? 'N/A'
                                              : String(v)}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      String(value)
                                    )}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ),
                      )
                    } catch (e) {
                      return (
                        <p className="text-red-500">
                          Unable to parse lab data.
                        </p>
                      )
                    }
                  })()}
                </div>
              )}
            </Card>

            {/* Clinical Tools Section */}
            <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                Generate Reports
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
                  onClick={handleDownloadClinicalSummary}
                >
                  Download Clinical Summary PDF
                </Button>
                <Button
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                  onClick={handleDownloadSalesScript}
                >
                  Download Sales Script PDF
                </Button>
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
                  {assigning ? 'Assigning...' : 'Assign Selected'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePrograms.map((program) => {
                  // const isDefault = defaultPrograms.includes(program);
                  const isAlreadyAssigned =
                    !!userData.assignedPrograms?.[program]
                  const isChecked = selectedPrograms.includes(program)

                  return (
                    <label
                      key={program}
                      className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isAlreadyAssigned
                          ? 'bg-blue-50 border-blue-200'
                          : isChecked
                            ? 'bg-blue-100 border-blue-300 shadow-md'
                            : 'hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAlreadyAssigned || assigning}
                        checked={isAlreadyAssigned || isChecked}
                        onChange={(e) =>
                          handleProgramSelect(program, e.target.checked)
                        }
                        className="h-5 w-5 text-blue-500 rounded border-blue-300 focus:ring-blue-500"
                      />
                      <span className="flex-1 font-medium text-blue-900">
                        {program}
                      </span>
                      {/* {isDefault && (
                      <span className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full font-medium">
                        default
                      </span>
                    )} */}
                      {isAlreadyAssigned && (
                        <span className="text-xs px-3 py-1 bg-green-500 text-white rounded-full font-medium">
                          assigned
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </Card>

            {/* Documents Section */}
            <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
              <h2 className="text-2xl font-bold text-blue-900 mb-8">
                Documents
              </h2>

              <div className="mb-8">
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleMultipleFileUpload(e.target.files)
                      }
                    }}
                    disabled={uploading}
                    className="hidden"
                  />

                  <label
                    htmlFor="fileUpload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${
                      uploading ? 'opacity-50' : 'hover:opacity-80'
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
                      {uploading ? 'Uploading...' : 'Upload Document'}
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
                {(() => {
                  const categories = ['labs', 'radiology', 'prescriptions']
                  const allDocs: { id: string; data: any }[] = []

                  categories.forEach((cat) => {
                    const section = userData?.[cat]
                    if (section && typeof section === 'object') {
                      Object.entries(section).forEach(
                        ([docId, docData]: any) => {
                          if (docData?.downloadURL) {
                            allDocs.push({
                              id: docId,
                              data: {
                                ...docData,
                                category: cat,
                              },
                            })
                          }
                        },
                      )
                    }
                  })

                  if (allDocs.length === 0) {
                    return (
                      <p className="text-blue-600 text-center">
                        No documents uploaded yet.
                      </p>
                    )
                  }

                  return allDocs.map(({ id, data }) => (
                    <div
                      key={id}
                      className="flex justify-between items-center bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <FileText className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">
                            {data.name || id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(data.size / 1024).toFixed(1)} KB •{' '}
                            {new Date(data.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                          onClick={() => handleViewPdf(data.downloadURL)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg"
                          onClick={async () => {
                            try {
                              setDownloadingFile(true)
                              const a = document.createElement('a')
                              a.href = data.downloadURL
                              a.download = data.name || 'document.pdf'
                              a.click()
                            } catch (err) {
                              console.error('Download error:', err)
                              toast.error('Download failed.')
                            } finally {
                              setDownloadingFile(false)
                            }
                          }}
                        >
                          <Download className="h-5 w-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() =>
                            handleDeleteFile(
                              data.category || 'labs',
                              id,
                              data.fullStorageName,
                            )
                          }
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                })()}
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
    </>
  )
}
