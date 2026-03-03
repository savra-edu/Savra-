"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, X, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { useSubjectsData } from "@/hooks/use-subjects"
import type { TeacherProfile } from "@/types/api"

export default function EditProfilePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { data: availableSubjectsData } = useSubjectsData()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<TeacherProfile | null>(null)

  // Fetch teacher profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<TeacherProfile>("/teacher/profile")
        setProfileData(response)
        setName(response.name || "")
        setEmail(response.email || "")
        setLocation(response.teacher?.location || "")
        setSelectedSubjectIds(response.teacher?.subjects?.map(s => s.id) || [])
      } catch (err) {
        // Use user data as fallback
        if (user) {
          setName(user.name || "")
          setEmail(user.email || "")
        }
      }
    }
    fetchProfile()
  }, [user])

  // Get subject names for display
  const selectedSubjects = availableSubjectsData?.filter(s => selectedSubjectIds.includes(s.id)) || []
  const availableSubjects = availableSubjectsData || []

  const removeSubject = (subjectId: string) => {
    setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjectId))
  }

  const addSubject = (subjectId: string) => {
    if (!selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId])
    }
    setShowSubjectDropdown(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await api.put("/teacher/profile", {
        name,
        subjectIds: selectedSubjectIds,
        location: location || undefined,
      })

      // Refresh user data in context
      await refreshUser()

      // Navigate back to profile page
      router.push("/user-profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/user-profile">
          <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
        </Link>
        <h1 className="text-lg lg:text-2xl font-bold text-[#242220]">Edit Profile</h1>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-[#FFE5D9] mb-4">
          <Image
            src="/pic.png"
            width={128}
            height={128}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          variant="outline"
          className="border-2 border-[#AB79DA] text-[#AB79DA] font-semibold rounded-lg py-2 px-6 bg-transparent"
        >
          Upload Image
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 flex-1">
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

          {/* Dropdown Button */}
          <div className="relative mb-4">
            <button
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              className="w-full border border-[#AB79DA] rounded-lg px-4 py-3 text-left text-gray-600 flex items-center justify-between text-sm"
            >
              <span>Select Subjects</span>
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showSubjectDropdown && (
              <div className="absolute top-full left-0 right-0 text-sm mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {availableSubjects
                  .filter(subject => !selectedSubjectIds.includes(subject.id))
                  .map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => addSubject(subject.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                    >
                      {subject.name}
                    </button>
                  ))}
                {availableSubjects.filter(subject => !selectedSubjectIds.includes(subject.id)).length === 0 && (
                  <div className="px-4 py-2 text-gray-500 text-sm">No more subjects available</div>
                )}
              </div>
            )}
          </div>

          {/* Selected Subjects Tags */}
          <div className="flex flex-wrap gap-3">
            {selectedSubjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-2 bg-white border border-[#4612CF87] rounded-md px-4 py-2"
              >
                <span className="text-gray-800 text-sm font-medium">{subject.name}</span>
                <button onClick={() => removeSubject(subject.id)}>
                  <X className="w-4 h-4" strokeWidth={2.25} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label className="block text-sm font-medium text-[#242220] mb-2">Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-[#AB79DA] rounded-lg px-4 py-3 pl-10"
              placeholder="Search location"
            />
            <ChevronDown className="absolute right-4 top-3.5 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-auto pt-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        <Button
          className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-4 rounded-xl disabled:opacity-50"
          onClick={handleSave}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
