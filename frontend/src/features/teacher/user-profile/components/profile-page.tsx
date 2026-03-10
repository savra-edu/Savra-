"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { X, Search, ChevronDown, ChevronLeft, MoreVertical, Pencil, Trash2, LogOut, Loader2, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useFetch, useMutation } from "@/hooks/use-api"
import { useSubjects } from "@/hooks/use-subjects"
import { useSchoolClasses } from "@/hooks/use-classes"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { api } from "@/lib/api"

interface ClassData {
  id: string
  name: string
  grade: number
  section: string
}

interface TeacherProfile {
  id: string
  name: string
  email: string
  phone?: string
  school?: {
    id: string
    name: string
    address?: string
  }
  subjects: string[]
  classes: ClassData[]
  teacherRole?: string | null
  location?: string | null
  profileImage?: string | null
  onboardingCompleted?: boolean
}

function UserProfileContent() {
  const router = useRouter()
  const { logout } = useAuth()
  const { refetchTeacherData } = useData()

  // Fetch profile from API
  const { data: profile, isLoading: profileLoading, refetch } = useFetch<TeacherProfile>("/teacher/profile")
  const { data: availableSubjects } = useSubjects()
  const { data: schoolClasses } = useSchoolClasses()
  const { mutate: updateProfile, isLoading: isSaving } = useMutation<Partial<TeacherProfile>, TeacherProfile>(
    "put",
    "/teacher/profile"
  )

  // Local state for form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Image upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Populate form when profile loads (only classes from grades 6-12)
  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setEmail(profile.email || "")
      setSubjects(profile.subjects || [])
      const profileClassIds = (profile.classes || [])
        .filter((c) => c.grade >= 6)
        .map((c) => c.id)
      setSelectedClassIds(profileClassIds)
      setLocation(profile.school?.address || "")
    }
  }, [profile])

  const subjectOptions = availableSubjects || ["Maths", "Science", "English", "History", "Geography", "Biology"]

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter((s) => s !== subject))
  }

  const removeClass = (classId: string) => {
    setSelectedClassIds(selectedClassIds.filter((id) => id !== classId))
  }

  const addClass = (classId: string) => {
    if (!selectedClassIds.includes(classId)) {
      setSelectedClassIds([...selectedClassIds, classId])
    }
    setShowClassDropdown(false)
  }

  // Get selected class objects for display (grades 6-12 only)
  const classesGrades6Plus = schoolClasses?.filter((c) => c.grade >= 6) || []
  const selectedClasses = classesGrades6Plus.filter((c) => selectedClassIds.includes(c.id))
  const availableClasses = classesGrades6Plus.filter((c) => !selectedClassIds.includes(c.id))

  const addSubject = (subject: string) => {
    if (!subjects.includes(subject)) {
      setSubjects([...subjects, subject])
    }
    setShowSubjectDropdown(false)
  }

  const handleSave = async () => {
    setSaveSuccess(false)
    setSaveError(null)
    const validClassIds = selectedClassIds.filter((id) =>
      classesGrades6Plus.some((c) => c.id === id)
    )

    try {
      await api.put("/teacher/profile", {
        name,
        email,
        subjects,
        classIds: validClassIds,
      })
      // Refresh both profile data and cached teacher subjects/classes used across the app
      await Promise.all([refetch(), refetchTeacherData()])
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/teacher/login")
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      await api.putUpload("/profile/avatar", formData)
      // Refresh profile to get new image
      await refetch()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = ""
    }
  }

  // Handle delete account
  const handleDeleteAccount = () => {
    setShowDeleteDialog(true)
    setDeletePassword("")
    setDeleteConfirmText("")
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      setDeleteError('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    if (!deletePassword) {
      setDeleteError("Please enter your password")
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await api.delete("/auth/account", {
        password: deletePassword,
        confirmText: deleteConfirmText,
      })

      // Log out and redirect
      logout()
      router.push("/teacher/login")
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading skeleton
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const displayName = name || profile?.name || "Teacher"
  const schoolInfo = profile?.school?.name
    ? `${profile.school.name}${profile.school.address ? `, ${profile.school.address}` : ""}`
    : "School not set"

  return (
    <>
      {/* Success/Error Toast */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg z-50">
          Profile updated successfully!
        </div>
      )}
      {(saveError || uploadError) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg z-50">
          {saveError || uploadError}
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account will be scheduled for permanent deletion.
              You have 30 days to contact support if you wish to recover your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {deleteError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
              </label>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting || deleteConfirmText !== "DELETE MY ACCOUNT"}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link href="/home">
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
              <DropdownMenuItem onClick={handleDeleteAccount} className="cursor-pointer text-red-600 focus:text-red-600">
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
        <div className="flex flex-col flex-1 px-2">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[#FFE5D9] mb-3">
              <Image
                src={profile?.profileImage || "/pic.png"}
                width={96}
                height={96}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={mobileFileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => mobileFileInputRef.current?.click()}
              disabled={isUploading}
              size="sm"
              className="border-2 border-[#AB79DA] text-[#AB79DA] font-semibold rounded-lg bg-transparent disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            <p className="text-sm font-medium text-[#9B61FF] mt-2">{profile?.teacherRole || "Teacher"}</p>
            <p className="text-xs text-gray-500">{schoolInfo}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#AB79DA] rounded-lg px-4 py-3"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#AB79DA] rounded-lg px-4 py-3"
                placeholder="Enter your email"
                type="email"
              />
            </div>

            {/* Subjects Field */}
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">Subjects</label>
              <div className="relative mb-3">
                <button
                  onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  className="w-full border border-[#AB79DA] rounded-lg px-4 py-3 text-left text-gray-600 flex items-center justify-between text-sm"
                >
                  <span>Select Subjects</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                {showSubjectDropdown && (
                  <div className="absolute top-full left-0 right-0 text-sm mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {subjectOptions.filter(s => !subjects.includes(s)).map((subject) => (
                      <button
                        key={subject}
                        onClick={() => addSubject(subject)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center gap-1 bg-[#FFE5D9] border border-[#DF6647] rounded-full px-3 py-1"
                  >
                    <span className="text-[#DF6647] text-xs font-medium">{subject}</span>
                    <button onClick={() => removeSubject(subject)}>
                      <X className="w-3 h-3 text-[#DF6647]" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Classes Field */}
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">Classes</label>
              <div className="relative mb-3">
                <button
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  className="w-full border border-[#AB79DA] rounded-lg px-4 py-3 text-left text-gray-600 flex items-center justify-between text-sm"
                >
                  <span>Select Classes</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                {showClassDropdown && (
                  <div className="absolute top-full left-0 right-0 text-sm mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {availableClasses.length > 0 ? (
                      availableClasses.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => addClass(cls.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                        >
                          Class {cls.grade} {cls.section}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        {selectedClasses.length > 0 ? "All classes selected" : "No classes available in your school"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedClasses.length > 0 ? (
                  selectedClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center gap-1 bg-[#F1E9FF] border border-[#9B61FF] rounded-full px-3 py-1"
                    >
                      <span className="text-[#9B61FF] text-xs font-medium">{cls.grade}{cls.section}</span>
                      <button onClick={() => removeClass(cls.id)}>
                        <X className="w-3 h-3 text-[#9B61FF]" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">No classes selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pb-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8 text-[#353535]">User Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Details Section */}
        <div className="lg:col-span-2">
          <Card className="p-8 border border-[#DDDDDD] bg-[#FFFEFD]">
            <h2 className="text-xl font-medium mb-2 pb-4 border-b border-[#DDDDDD]">Account Details</h2>

            <div className="space-y-6">
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

              {/* Subjects Field */}
              <div>
                <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Subjects</label>

                {/* Dropdown Button */}
                <div className="relative mb-4">
                  <button
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="w-full border border-[#7D5CB0] rounded-lg px-4 py-3 text-left text-gray-600 flex items-center justify-between text-sm"
                  >
                    <span>Select Subjects</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 right-0 text-sm mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {subjectOptions.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => addSubject(subject)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Subjects Tags */}
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center gap-2 bg-white border border-[#4612CF87] rounded-md px-4 py-2"
                    >
                      <span className="text-gray-800 text-sm font-medium">{subject}</span>
                      <button onClick={() => removeSubject(subject)}>
                        <X className="w-4 h-4" strokeWidth={2.25} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classes Field (Editable) */}
              <div>
                <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Classes</label>

                {/* Dropdown Button */}
                <div className="relative mb-4">
                  <button
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className="w-full border border-[#7D5CB0] rounded-lg px-4 py-3 text-left text-gray-600 flex items-center justify-between text-sm"
                  >
                    <span>Select Classes</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showClassDropdown && (
                    <div className="absolute top-full left-0 right-0 text-sm mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {availableClasses.length > 0 ? (
                        availableClasses.map((cls) => (
                          <button
                            key={cls.id}
                            onClick={() => addClass(cls.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                          >
                            Class {cls.grade} {cls.section}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          {selectedClasses.length > 0 ? "All classes selected" : "No classes available in your school"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Classes Tags */}
                <div className="flex flex-wrap gap-3">
                  {selectedClasses.length > 0 ? (
                    selectedClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-2 bg-[#F1E9FF] border border-[#9B61FF] rounded-md px-4 py-2"
                      >
                        <span className="text-[#9B61FF] text-sm font-medium">Class {cls.grade} {cls.section}</span>
                        <button onClick={() => removeClass(cls.id)}>
                          <X className="w-4 h-4 text-[#9B61FF]" strokeWidth={2.25} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No classes selected</p>
                  )}
                </div>
              </div>

              {/* Role Field (Read-only) */}
              <div>
                <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Role</label>
                <div className="w-full border border-[#7D5CB0] rounded-lg px-4 py-3 bg-gray-50">
                  <span className="text-gray-700">{profile?.teacherRole || "Teacher"}</span>
                </div>
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-sm font-normal text-[#6A6A6A] mb-2">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-[#7D5CB0] rounded-lg px-4 py-6 pl-10"
                    placeholder="Search location"
                  />
                  <ChevronDown className="absolute right-4 top-3.5 w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-28">
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
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
                  src={profile?.profileImage || "/pic.png"}
                  width={128}
                  height={128}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Upload Image Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-[200px] mb-6 border-2 border-[#AB79DA] text-[#AB79DA] font-bold rounded-lg py-4 font-medium bg-transparent disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>

            {/* Profile Info */}
            <div className="space-y-4 mb-6 w-full">
              <div>
                <h3 className="text-lg font-bold text-[#242220]">{displayName}</h3>
                <p className="text-sm font-medium text-[#9B61FF]">{profile?.teacherRole || "Teacher"}</p>
              </div>
              <p className="text-sm font-medium text-[#242220]">
                {schoolInfo}
              </p>

              {/* Classes in Profile Card */}
              {profile?.classes && profile.classes.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Classes</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.classes.map((cls) => (
                      <span
                        key={cls.id}
                        className="px-2 py-1 bg-[#F1E9FF] text-[#9B61FF] text-xs font-medium rounded-full"
                      >
                        {cls.grade}{cls.section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects in Profile Card */}
              {subjects && subjects.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Subjects</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-[#FFE5D9] text-[#DF6647] text-xs font-medium rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  )
}
