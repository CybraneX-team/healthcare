'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { ref, get, set, onValue, push, remove, update } from 'firebase/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  CheckCircle,
  Clock,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { db, rtdb } from '@/utils/firebase'
import { DevBundlerService } from 'next/dist/server/lib/dev-bundler-service'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useProgramContext } from '@/hooks/useProgressData'
import { setRequestMeta } from 'next/dist/server/request-meta'

interface ProgramsManagerProps {
  onProgramSelect: (programId: string) => void
  setSidebarOpen: (open: boolean) => void
}

export function ProgramsManager({
  onProgramSelect,
  setSidebarOpen,
}: ProgramsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setisLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const [loadingText, setloadingText] = useState<any>('Adding Programme')
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    status: 'active',
  })

  const [programs, setPrograms] = useState<any>([])
  const [userProgramProgress, setUserProgramProgress] = useState<
    Record<string, number>
  >({})
  const { recentActivity, setrecentActivity } = useProgramContext()
  // Mock data for programs
  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setUserProgramProgress(data.programProgress || {})
      }
    })
  }, [])

  useEffect(() => {
    const fetchPrograms = async () => {
      const programsRef = ref(rtdb, 'courses/thrivemed/programs')
      const snapshot = await get(programsRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const loadedPrograms = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
          createdAt: new Date(value.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }))
        setPrograms(loadedPrograms)
      }
    }

    fetchPrograms()
  }, [])

  const filteredPrograms = programs.filter(
    (program: any) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProgram = async () => {
    setisLoading(true)
    setIsAddDialogOpen(false)
    const id = newProgram.name.toLowerCase().replace(/\s+/g, '-')

    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const newItem = {
      activity: 'Added new program',
      name: newProgram.name,
      createdAt: Date.now(),
    }

    setrecentActivity((prev: any) => {
      const next = [...prev, newItem]
      // fire-and-forget; no await needed here
      updateDoc(userRef, { recentActivity: next })
      return next
    })

    await updateDoc(userRef, {
      recentActivity: recentActivity,
    })

    const newProgramData = {
      id,
      ...newProgram,
      progress: 0,
      modules: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const programRef = ref(rtdb, `courses/thrivemed/programs/${id}`)
      await set(programRef, newProgramData)

      setPrograms([
        ...programs,
        {
          ...newProgramData,
          createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
      ])
    } catch (error) {
      console.error('Error saving to Firebase:', error)
    } finally {
      setNewProgram({ name: '', description: '', status: 'active' })
      setisLoading(false)
    }
  }

  const handleEditProgram = async () => {
    setisLoading(true)
    setloadingText('Editing Programme')
    setIsEditDialogOpen(false)
    if (!selectedProgram) return

    const updatedData = {
      ...selectedProgram,
      updatedAt: new Date().toISOString(),
    }

    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const newItem = {
      activity: `Updated  program ${selectedProgram.name}`,
      name: selectedProgram.name,
      createdAt: Date.now(),
    }

    setrecentActivity((prev: any) => {
      const next = [...prev, newItem]
      // fire-and-forget; no await needed here
      updateDoc(userRef, { recentActivity: next })
      return next
    })

    try {
      const programRef = ref(
        rtdb,
        `courses/thrivemed/programs/${selectedProgram.id}`,
      )
      await update(programRef, updatedData)

      const updatedPrograms = programs.map((program: any) =>
        program.id === selectedProgram.id
          ? {
              ...updatedData,
              createdAt: program.createdAt,
            }
          : program,
      )

      setPrograms(updatedPrograms)
    } catch (error) {
      console.error('Failed to update program in Firebase:', error)
    } finally {
      setisLoading(false)
      setloadingText('Adding Programme')
    }
  }

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return
    setisLoading(false)
    setloadingText('Deleting  Programme')
    setIsDeleteDialogOpen(false)

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const newItem = {
        activity: `Deleted   program ${selectedProgram.name}`,
        name: selectedProgram.name,
        createdAt: Date.now(),
      }

      setrecentActivity((prev: any) => {
        const next = [...prev, newItem]
        // fire-and-forget; no await needed here
        updateDoc(userRef, { recentActivity: next })
        return next
      })

      const programRef = ref(
        rtdb,
        `courses/thrivemed/programs/${selectedProgram.id}`,
      )
      await remove(programRef)

      const updatedPrograms = programs.filter(
        (program: any) => program.id !== selectedProgram.id,
      )
      setPrograms(updatedPrograms)
    } catch (error) {
      console.error('Error deleting program from Firebase:', error)
    } finally {
      setisLoading(false)
      setloadingText('Adding  Programme')
    }
  }

  const openEditDialog = (program: any) => {
    setSelectedProgram({ ...program })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (program: any) => {
    setSelectedProgram(program)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4
                    bg-black/30 backdrop-blur-sm"
        >
          <div className="loader" />
          <span className="text-sm my-5 font-medium text-white">
            {loadingText}…
          </span>
        </div>
      )}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Programs Management
          </h1>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] mx-4">
              <DialogHeader>
                <DialogTitle>Add New Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Program Name
                  </label>
                  <Input
                    id="name"
                    value={newProgram.name}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, name: e.target.value })
                    }
                    placeholder="Enter program name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newProgram.description}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter program description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full rounded-md border border-gray-300 p-2 bg-white"
                    value={newProgram.status}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
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
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                  onClick={handleAddProgram}
                >
                  Add Program
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
              placeholder="Search programs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="rounded-md border border-gray-300 p-2 w-full sm:w-auto">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Programs list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program: any, index: any) => {
            const progress = userProgramProgress[program.id] || 0
            return (
              <Card
                key={index}
                className="overflow-hidden rounded-xl shadow-sm border-0"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {program.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onProgramSelect(program.id)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>View Modules</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(program)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(program)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 100" className="h-full w-full">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e6e6e6"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={
                              program.status === 'completed'
                                ? '#10b981'
                                : '#3b82f6'
                            }
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={`${progress * 2.51} 251`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      {program.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-xs font-medium">{progress}%</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 block truncate">
                        {program.status === 'active' && 'Active'}
                        {program.status === 'draft' && 'Draft'}
                        {program.status === 'completed' && 'Completed'}
                      </span>
                      <div className="text-xs text-gray-500">
                        {program.modules && Object.keys(program.modules)?.length
                          ? Object.keys(program.modules).length
                          : ''}{' '}
                        modules
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        Created {program.createdAt}
                      </span>
                    </div>
                    <Button
                      onClick={() => onProgramSelect(program.id)}
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm w-full sm:w-auto"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Edit Program Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>
            {selectedProgram && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    Program Name
                  </label>
                  <Input
                    id="edit-name"
                    value={selectedProgram.name}
                    onChange={(e) =>
                      setSelectedProgram({
                        ...selectedProgram,
                        name: e.target.value,
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
                    value={selectedProgram.description}
                    onChange={(e) =>
                      setSelectedProgram({
                        ...selectedProgram,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={selectedProgram.status}
                    onChange={(e) =>
                      setSelectedProgram({
                        ...selectedProgram,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
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
                onClick={handleEditProgram}
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
              <DialogTitle>Delete Program</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete "{selectedProgram?.name}"? This
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
                onClick={handleDeleteProgram}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
