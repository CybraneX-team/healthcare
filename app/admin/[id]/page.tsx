'use client'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
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
  UserIcon,
  X,
  CheckCircle,
  Calendar,
  Eye,
  Download,
  ScanLine,
  UploadCloud,
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
import { getPromptClinicalAndSalesScript } from '@/data/export-prompts'
import PromptChatbotModal from '@/components/PromptChatbotModal'
import { samplePdfData } from '@/sameple-text-json'

const Viewer = dynamic(
  () => import('@react-pdf-viewer/core').then((mod) => mod.Viewer),
  { ssr: false },
)
const Worker = dynamic(
  () => import('@react-pdf-viewer/core').then((mod) => mod.Worker),
  { ssr: false },
)

type ContentItem = {
  type: string
  text: string
}

export default function UserDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const [userData, setUserData] = useState<any | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const viewerRef = useRef<HTMLDivElement>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [activePromptType, setActivePromptType] = useState<
    'summary' | 'sales' | null
  >(null)
  const [assigning, setAssigning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [promptText, setPromptText] = useState<string>('')
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

  // const openPromptModal = (type: 'summary' | 'sales') => {
  //   setActivePromptType(type)

  //   const promptValue =
  //     type === 'summary'
  //       ? getPromptClinicalAndSalesScript(
  //           'summary',
  //           userData?.extractedLabData,
  //         ) || ''
  //       : getPromptClinicalAndSalesScript(
  //           'sales',
  //           userData?.extractedLabData,
  //         ) || ''
  //   setPromptText(promptValue)
  // }

  const prompt = ` You are a medical data extraction assistant.

Your task is to analyze the provided medical report files (PDFs or scans) and extract all relevant lab results or medical values **strictly based on the following schema**:

--- BEGIN SCHEMA ---
${JSON.stringify(samplePdfData, null, 2)}
--- END SCHEMA ---

### IMPORTANT INSTRUCTIONS:

1. **Do NOT change the structure of the schema.**
   - You must return a single JSON object with all top-level and nested keys **exactly as shown** above.
   - The schema includes categories like: liver, kidney, brain, heart, lungs, hormonal_reproductive, etc.

2. **Include every field from the schema**, even if its value is missing.
   - If a value is present in the reports, extract and assign it.
   - If it's not found, use:
     - null for numbers, booleans, and objects
     - "" (empty string) for strings, logs, or impressions

3. **Do NOT add any new fields.**
   - You must extract only what is in the schema above. Any additional information should be ignored.

4. **Apply smart field matching:**
   - Field names in the PDF may vary from the schema. Use case-insensitive, flexible matching.
   - Examples of smart mappings:
     - "AST (SGOT)" or "AST" → ast
     - "ALT (SGPT)" or "ALT" → alt
     - "GGT" or "GGTP" → ggt
     - "Total Bilirubin" → bilirubin
     - "HbA1c" or "Hemoglobin A1c" → hba1c
     - "TSH" → tsh
     - "Testosterone Total" or "Total Testosterone" → testosterone_total
     - "SHBG" → shbg
     - "25-Hydroxy Vitamin D" → vitamin_d_25oh_total

   Use medical knowledge to match common aliases with their correct schema field.

5. **Return clean JSON output:**
   - No Markdown formatting
   - No explanations or extra text
   - Output must be directly parsable as a JSON object

### Example Behavior:

- If "ALT (SGPT)" = 34 appears in the report, map it to "liver.alt": 34
- If "GGT" is not present in the report, return "ggt": null
- If "Fatty Liver Grade 1 appears, return "fatty_liver": "grade 1" (as string)
- For any log/impression text like "Chest X-ray normal", add it as a string under its correct log field

---

🔁 Repeat the above process for all documents provided. Final result = one merged JSON object matching the schema exactly.
`

  const openPromptModal = (type: 'summary' | 'sales') => {
    if (!userData) return
    setActivePromptType(type)

    const promptValue =
      type === 'summary'
        ? getPromptClinicalAndSalesScript('summary', userData.extractedLabData)
        : getPromptClinicalAndSalesScript('sales', userData.extractedLabData)

    setPromptText(promptValue.trim())
    setChatOpen(true)
  }

  const closePromptModal = () => {
    setActivePromptType(null)
  }

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
      message: 'Uploading  PDFs...',
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
      // THIS assumes you're only extracting ONE unified object for all files
      const { extractedJsonArray: rawReply } = await res.json()

      // No need to clean — it's already parsed JSON
      const extractedJsonObject = rawReply

      // Construct Firestore updates
      const userRef = doc(db, 'users', id as string)
      const updatedDocs: any = {}
      // const structuredExtractedData: Record<string, any> = {};

      uploadedMetadata.forEach((meta) => {
        updatedDocs[meta.docKey] = {
          name: meta.file.name,
          size: meta.file.size,
          type: meta.file.type,
          uploadedAt: new Date().toISOString(),
          downloadURL: meta.downloadURL,
          fullStorageName: meta.fullStorageName,
        }
      })

      // Store full extracted JSON under a single key like "combined_report"
      const updatePayload: any = {
        labs: {
          ...(userData?.labs || {}),
          ...updatedDocs,
        },
      }

      if (rawReply !== undefined) {
        updatePayload.extractedLabData = rawReply
      }

      await updateDoc(userRef, updatePayload)

      setUserData((prev: any) => ({
        ...prev,
        labs: {
          ...(prev?.labs || {}),
          ...updatedDocs,
        },
        extractedLabData: rawReply,
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
          promptText: promptText,
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
          promptText: promptText,
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

  const handleAnalyzeDocuments = async () => {
    if (!id) return
    const labs = userData?.labs || {}
    const filesMeta = Object.values(labs) as any[]

    if (!filesMeta.length) {
      toast.info('No documents to analyze.')
      return
    }

    setAnalyzing(true)
    setprocessingText({ active: true, message: 'Analyzing documents…' })

    try {
      const formData = new FormData()

      /* download each stored file and re-append as File */
      for (const meta of filesMeta) {
        const res = await fetch(meta.downloadURL)
        const blob = await res.blob()
        const file = new File([blob], meta.name, { type: blob.type })
        formData.append('files', file)
      }

      const openAiRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          input: [
            {
              role: 'user',
              content: [
                ...filesMeta.map((meta) => ({
                  type: 'input_file',
                  file_url: meta.downloadURL,
                })),
                {
                  type: 'input_text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      const result = await openAiRes.json()
      const replyText = result.output?.[0]?.content?.find(
        (c: ContentItem) => c.type === 'output_text',
      )?.text

      if (!replyText) {
        throw new Error('No output text returned by OpenAI')
      }

      const cleaned = replyText.replace(/```json|```/g, '').trim()

      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (err) {
        console.error('Failed to parse JSON:', cleaned)
        throw err
      }

      if (typeof id !== 'string') {
        throw new Error('Invalid user ID')
      }
      await updateDoc(doc(db, 'users', id), {
        extractedLabData: parsed,
      })
      setUserData((prev: any) => ({
        ...prev,
        extractedLabData: parsed,
      }))
      toast.success('Documents analyzed!')
    } catch (err) {
      console.error(err)
      toast.error('Analysis failed.')
    } finally {
      setAnalyzing(false)
      setprocessingText({ active: false, message: '' })
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
                <div>
                  <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-2">
                    Gender
                  </h3>
                  <p className="text-xl font-semibold text-blue-900">
                    {userData.gender ? userData.gender : 'N/A'}
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
                          <motion.div
                            key={sectionName}
                            className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-3xl shadow-lg border border-blue-100/50 hover:scale-105 hover:shadow-xl transition-all duration-200"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <h3 className="text-blue-700 font-bold text-lg mb-2 capitalize">
                              {sectionName.replace(/_/g, ' ')}
                            </h3>
                            <div className="space-y-3">
                              {Object.entries(sectionData || {}).map(
                                ([label, value]) => (
                                  <div key={label} className="group">
                                    <div className="flex items-start justify-between p-3 bg-white/60 rounded-2xl border border-blue-100/30 hover:bg-white/80 hover:border-blue-200/50 transition-all duration-200">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-sm font-semibold text-blue-800 capitalize">
                                            {label.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <div className="ml-4">
                                          {value === null || value === '' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                              N/A
                                            </span>
                                          ) : typeof value === 'object' &&
                                            !Array.isArray(value) ? (
                                            <div className="space-y-2 mt-2">
                                              {Object.entries(value).map(
                                                ([k, v]) => (
                                                  <div
                                                    key={k}
                                                    className="flex items-center justify-between p-2 bg-blue-50/50 rounded-xl"
                                                  >
                                                    <span className="text-xs font-medium text-blue-700 capitalize">
                                                      {k.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-blue-900 font-semibold">
                                                      {v === null || v === ''
                                                        ? 'N/A'
                                                        : String(v)}
                                                    </span>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                              {String(value)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </motion.div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clinical Summary */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Clinical Summary
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                      onClick={handleDownloadClinicalSummary}
                      title="Download Clinical Summary PDF"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-xl font-medium"
                      onClick={() => openPromptModal('summary')}
                      title="Edit the clinical summary prompt"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Prompt
                    </Button>
                  </div>
                </div>

                {/* Sales Script */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Sales Script
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                      onClick={handleDownloadSalesScript}
                      title="Download Sales Script PDF"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl font-medium"
                      onClick={() => openPromptModal('sales')}
                      title="Edit the sales script prompt"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Prompt
                    </Button>
                  </div>
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
                  {assigning ? 'Assigning...' : 'Assign Selected'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePrograms.map((program) => {
                  const isAlreadyAssigned =
                    !!userData.assignedPrograms?.[program]
                  const isChecked = selectedPrograms.includes(program)

                  return (
                    <motion.label
                      key={program}
                      className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isAlreadyAssigned
                          ? 'bg-blue-50 border-blue-200'
                          : isChecked
                            ? 'bg-blue-100 border-blue-300 shadow-md'
                            : 'hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
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
                      {isAlreadyAssigned && (
                        <span className="text-xs px-3 py-1 bg-green-500 text-white rounded-full font-medium">
                          assigned
                        </span>
                      )}
                    </motion.label>
                  )
                })}
              </div>
            </Card>

            {/* Documents Section */}
            <Card className="p-8 bg-white shadow-lg rounded-2xl border border-blue-100 lg:col-span-3">
              <h2 className="mb-8 text-2xl font-bold text-blue-900">
                Documents
              </h2>

              {/* Upload area */}
              <div className="mb-8">
                <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-12 text-center transition-colors duration-200 hover:bg-blue-100">
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) =>
                      e.target.files && handleMultipleFileUpload(e.target.files)
                    }
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className={`flex cursor-pointer flex-col items-center justify-center ${
                      uploading ? 'opacity-50' : 'hover:opacity-80'
                    }`}
                  >
                    <FileUpload
                      label="Upload Document"
                      onChange={(e: any) => {
                        handleMultipleFileUpload(e.target.files)
                      }}
                    />
                    <p className="mt-6 text-sm font-medium text-blue-600">
                      PDF, JPEG, PNG, DOC • 10 MB max
                    </p>
                  </label>
                  {uploading && (
                    <div className="mt-6 h-3 w-full rounded-full bg-blue-200">
                      <div className="h-3 w-1/2 animate-pulse rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Document list */}
              <div className="space-y-4">
                {(() => {
                  const docs: { id: string; data: any }[] = []
                  Object.entries(userData.labs || {}).forEach(([key, d]: any) =>
                    docs.push({ id: key, data: d }),
                  )
                  if (!docs.length)
                    return (
                      <p className="text-center text-blue-600">
                        No documents uploaded yet.
                      </p>
                    )
                  return docs.map(({ id: docId, data }) => (
                    <motion.div
                      key={docId}
                      className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm transition hover:shadow-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
                            {data.name || docId}
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
                          className="h-10 w-10 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-500"
                          onClick={() => handleViewPdf(data.downloadURL)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-500"
                          onClick={async () => {
                            try {
                              setDownloadingFile(true)
                              const a = document.createElement('a')
                              a.href = data.downloadURL
                              a.download = data.name
                              a.click()
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
                          className="h-10 w-10 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500"
                          onClick={() =>
                            handleDeleteFile(
                              data.category || 'labs',
                              docId,
                              data.fullStorageName,
                            )
                          }
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                })()}
              </div>

              {/* Analyze button */}
              <div className="mt-10 flex justify-center">
                <Tooltip.Provider>
                  <Tooltip.Root delayDuration={200}>
                    <Tooltip.Trigger asChild>
                      <div>
                        <Button
                          onClick={handleAnalyzeDocuments}
                          className="flex items-center gap-2 rounded-xl bg-[#2A80B3] px-8 py-3 font-semibold 
                  text-white shadow-lg transition 
                  disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <UploadCloud className="h-5 w-5" />
                          {analyzing
                            ? 'Processing uploaded files…'
                            : 'Process uploaded files'}
                        </Button>
                      </div>
                    </Tooltip.Trigger>

                    {!Object.keys(userData.labs || {}).length &&
                      !uploading &&
                      !analyzing && (
                        <Tooltip.Content
                          side="top"
                          sideOffset={8}
                          className="z-50 rounded-md bg-black px-3 py-2 text-sm text-white shadow-md animate-fadeIn"
                        >
                          Upload at least one document to enable this
                          <Tooltip.Arrow className="fill-black" />
                        </Tooltip.Content>
                      )}
                  </Tooltip.Root>
                </Tooltip.Provider>
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
        {/* {activePromptType && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {activePromptType === 'summary'
                    ? 'Edit Clinical Summary Prompt'
                    : 'Edit Sales Script Prompt'}
                </h3>
                <button
                  onClick={closePromptModal}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

             <PromptChatbotModal
              isOpen={chatOpen}
              initialPrompt={promptText}       // same value you already derive
              userName={userData.fullName || 'You'}
              onClose={() => setChatOpen(false)}
              onSave={async (newPrompt) => {
                if (!id) return;
                const userRef = doc(db, 'users', id as string);
                const field =
                  activePromptType === 'summary' ? 'clinicalPrompt' : 'salesPrompt';
                await updateDoc(userRef, { [field]: newPrompt });
                setUserData((p: any) => ({ ...p, [field]: newPrompt }));
                toast.success('Prompt updated successfully.');
              }}
            />

              <div className="mt-4 flex justify-end space-x-3">
                <Button variant="ghost" onClick={closePromptModal}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={async () => {
                    if (!id) return
                    const userRef = doc(db, 'users', id as string)
                    const field =
                      activePromptType === 'summary'
                        ? 'clinicalPrompt'
                        : 'salesPrompt'

                    await updateDoc(userRef, { [field]: promptText })

                    setUserData((prev: any) => ({
                      ...prev,
                      [field]: promptText,
                    }))

                    toast.success('Prompt updated successfully.')
                    closePromptModal()
                  }}
                >
                  Save Prompt
                </Button>
              </div>
            </div>
          </div>
        )} */}

        {chatOpen && (
          <PromptChatbotModal
            isOpen={chatOpen}
            initialPrompt={promptText}
            userName={userData.fullName || 'You'}
            onClose={() => {
              setChatOpen(false)
              setActivePromptType(null)
            }}
            onSave={async (newPrompt) => {
              if (!id) return
              const field =
                activePromptType === 'summary'
                  ? 'clinicalPrompt'
                  : 'salesPrompt'
              await updateDoc(doc(db, 'users', id as string), {
                [field]: newPrompt,
              })
              setUserData((p: any) => ({ ...p, [field]: newPrompt }))
              setPromptText(newPrompt)
              toast.success('Prompt updated successfully.')
            }}
          />
        )}
      </div>
    </>
  )
}
