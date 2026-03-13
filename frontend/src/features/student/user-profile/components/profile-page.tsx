"use client"

import { Suspense, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, MoreVertical, Pencil, Trash2, LogOut, X, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useStudentProfile, useAllSubjects, useSchoolClasses } from "@/hooks/use-student"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { useData } from "@/contexts/data-context"

interface Subject {
  id: string
  name: string
  code?: string
}

interface ClassItem {
  id: string
  name: string
  grade: number
  section: string
}

function StudentProfileContent() {
  const router = useRouter()
  const { logout, refreshUser } = useAuth()
  const { data: profile, isLoading: profileLoading } = useStudentProfile()
  const { data: allSubjectsData } = useAllSubjects()
  const { data: schoolClassesData } = useSchoolClasses()
  const { refetchStudentData } = useData()

  // Local state for form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const allSubjects = allSubjectsData?.subjects || []
  const schoolClasses = schoolClassesData?.classes || []

  // Get student data from profile - it's nested under profile.profile or profile.student
  // Also check for direct class/subjects (backend might return either format)
  const getStudentData = () => {
    if (!profile) return { class: undefined, subjects: undefined }
    const nested = (profile as unknown as { profile?: { class?: ClassItem; subjects?: Subject[] }; student?: { class?: ClassItem; subjects?: Subject[] } })
    const direct = (profile as unknown as { class?: ClassItem; subjects?: Subject[] })
    return {
      class: nested.profile?.class || nested.student?.class || direct.class,
      subjects: nested.profile?.subjects || nested.student?.subjects || direct.subjects
    }
  }

  // Get class info for display in dropdown
  const profileClass = getStudentData().class

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      console.log('Full profile object:', JSON.stringify(profile, null, 2))
      setName(profile.name || "")
      setEmail(profile.email || "")

      const studentData = getStudentData()
      console.log('Extracted class:', studentData.class)
      console.log('Extracted subjects:', studentData.subjects)

      if (studentData.class) {
        setSelectedClassId(studentData.class.id)
      }
      if (studentData.subjects && studentData.subjects.length > 0) {
        console.log('Setting selected subjects:', studentData.subjects)
        setSelectedSubjects(studentData.subjects)
      } else {
        console.log('No subjects found in profile')
      }
    }
  }, [profile])

  // Debug: log schoolClasses when they load
  useEffect(() => {
    console.log('School classes loaded:', schoolClasses)
    console.log('Selected class ID:', selectedClassId)
    console.log('Profile class:', profileClass)
  }, [schoolClasses, selectedClassId, profileClass])

  const handleAddSubject = (subject: Subject) => {
    if (!selectedSubjects.find(s => s.id === subject.id)) {
      setSelectedSubjects([...selectedSubjects, subject])
    }
  }

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.id !== subjectId))
  }

  const handleSave = async () => {
    setSaveSuccess(false)
    setSaveError(null)
    setIsSaving(true)

    const payload = {
      name,
      classIds: selectedClassId ? [selectedClassId] : [],
      subjectIds: selectedSubjects.map(s => s.id),
    }
    console.log('Saving profile with payload:', payload)

    try {
      const response = await api.put("/profile", payload)
      console.log('Profile save response:', response)
      setSaveSuccess(true)
      // Refresh data
      await refreshUser()
      await refetchStudentData()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Profile save error:', err)
      setSaveError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/student/login")
  }

  // Loading skeleton
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const displayName = profile?.name || "Student"
  const displayEmail = profile?.email || ""
  const avatarUrl = profile?.avatarUrl
  // Backend returns 'profile' not 'student'
  const studentData = profile?.profile || profile?.student
  const studentClass = studentData?.class
  const schoolName = studentClass?.school?.name || "Savra International School"
  const schoolInfo = studentClass
    ? `${schoolName} | Class ${studentClass.grade}${studentClass.section ? `-${studentClass.section}` : ""}`
    : "Class not assigned"

  return (
    <>
      {/* Success/Error Toast */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg z-50">
          Profile saved successfully!
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg z-50">
          {saveError}
        </div>
      )}

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link href="/student-home">
              <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
            </Link>
            <h1 className="text-lg font-bold text-[#242220]">User Profile</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5 text-black" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/profile/edit")} className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2 text-red-600" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col items-center flex-1">
          {/* Avatar */}
          <div className="mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-[#FFE5D9]">
              <Image
                src={avatarUrl || "/Pic.png"}
                width={128}
                height={128}
                alt="Profile"
                className="w-full h-full object-cover"
                sizes="128px"
              />
            </div>
          </div>

          {/* Upload Image Button */}
          <Button
            variant="outline"
            className="mb-6 border-2 border-[#AB79DA] text-[#AB79DA] font-semibold rounded-lg py-2 px-6 bg-transparent"
          >
            Upload Image
          </Button>

          {/* Profile Info */}
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-bold text-[#242220]">{displayName}</h3>
            <p className="text-base font-medium text-[#242220]">Student</p>
            <p className="text-sm font-medium text-[#242220]">
              {schoolInfo}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-[80vh] p-8">
        <h1 className="text-3xl font-bold mb-8 text-[#353535]">User Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Details Section */}
          <div className="lg:col-span-2">
            <Card className="p-8 border border-[#DDDDDD] bg-[#FFFEFD] min-h-[650px] flex flex-col">
              <h2 className="text-xl font-medium mb-2 pb-4 border-b border-[#DDDDDD]">Account Details</h2>

              <div className="space-y-6 flex-1">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#7D5CB0] rounded-lg px-4 py-6"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#7D5CB0] rounded-lg px-4 py-6"
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Class</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center justify-between border border-[#7D5CB0] rounded-lg px-4 py-4 text-left bg-white hover:bg-gray-50">
                        <span className="text-[#353535]">
                          {selectedClassId
                            ? (() => {
                                // First try to find in schoolClasses, fallback to profileClass
                                const cls = schoolClasses.find(c => c.id === selectedClassId)
                                if (cls) {
                                  return `Class ${cls.grade}${cls.section ? `-${cls.section}` : ''}`
                                }
                                // Fallback to profile class if it matches
                                if (profileClass && profileClass.id === selectedClassId) {
                                  return `Class ${profileClass.grade}${profileClass.section ? `-${profileClass.section}` : ''}`
                                }
                                return 'Select Class'
                              })()
                            : 'Select Class'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px] max-h-[300px] overflow-y-auto">
                      {schoolClasses.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">Loading classes...</div>
                      )}
                      {schoolClasses.map((cls) => (
                        <DropdownMenuItem
                          key={cls.id}
                          onClick={() => setSelectedClassId(cls.id)}
                          className={`cursor-pointer ${cls.id === selectedClassId ? 'bg-purple-100' : ''}`}
                        >
                          Class {cls.grade}{cls.section ? `-${cls.section}` : ''}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Subjects Selection */}
                <div>
                  <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Subjects</label>

                  {/* Selected Subjects Tags */}
                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSubjects.map((subject) => (
                        <span
                          key={subject.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#E2DFF0] text-[#353535] rounded-full text-sm"
                        >
                          {subject.name}
                          <button
                            onClick={() => handleRemoveSubject(subject.id)}
                            className="hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Subject Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center justify-between border border-[#7D5CB0] rounded-lg px-4 py-4 text-left bg-white hover:bg-gray-50">
                        <span className="text-gray-500">Add Subject</span>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px] max-h-[300px] overflow-y-auto">
                      {allSubjects
                        .filter(s => !selectedSubjects.find(sel => sel.id === s.id))
                        .map((subject) => (
                          <DropdownMenuItem
                            key={subject.id}
                            onClick={() => handleAddSubject(subject)}
                            className="cursor-pointer"
                          >
                            {subject.name}
                          </DropdownMenuItem>
                        ))}
                      {allSubjects.filter(s => !selectedSubjects.find(sel => sel.id === s.id)).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">All subjects selected</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-auto pt-8">
                <Button
                  variant="outline"
                  className="flex-1 border border-[#DF6647] text-[#DF6647] rounded-lg py-6 font-semibold bg-transparent"
                >
                  Delete Account
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[#DF6647] text-white rounded-lg py-6 font-semibold disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Profile Card Section */}
          <div>
            <Card className="p-4 border border-gray-200 text-center sticky top-8 flex flex-col items-center">
              <h2 className="text-2xl font-medium mb-6 pb-4 border-b border-gray-200 w-full">Profile</h2>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-[#AB79DA] overflow-hidden flex items-center justify-center">
                  <Image
                    src={avatarUrl || "/Pic.png"}
                    width={128}
                    height={128}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    sizes="128px"
                  />
                </div>
              </div>

              {/* Upload Image Button */}
              <Button
                variant="outline"
                className="w-[200px] mb-6 border-2 border-[#AB79DA] text-[#AB79DA] font-bold rounded-lg py-4 font-medium bg-transparent"
              >
                Upload Image
              </Button>

              {/* Profile Info */}
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#242220]">{displayName}</h3>
                  <p className="text-sm font-medium text-[#242220]">Student</p>
                </div>
                <p className="text-sm font-medium text-[#242220]">
                  {schoolInfo}
                </p>
              </div>

              {/* Log Out Link */}
              <button
                onClick={handleLogout}
                className="text-[#E10000] border-t pt-6 border-gray-200 font-semibold text-center w-full"
              >
                Log Out
              </button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={null}>
      <StudentProfileContent />
    </Suspense>
  )
}
