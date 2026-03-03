"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/use-student"

export default function EditProfilePage() {
  const router = useRouter()
  const { data: profile, isLoading: profileLoading } = useStudentProfile()
  const { mutate: updateProfile, isLoading: isSaving } = useUpdateStudentProfile()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setEmail(profile.email || "")
    }
  }, [profile])

  const handleSave = async () => {
    setSaveSuccess(false)
    setSaveError(null)

    try {
      await updateProfile({ name, email })
      setSaveSuccess(true)
      // Redirect back to profile after successful save
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile")
    }
  }

  const avatarUrl = profile?.avatarUrl

  // Loading skeleton
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto">
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile">
          <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
        </Link>
        <h1 className="text-lg lg:text-2xl font-bold text-[#242220]">Edit Profile</h1>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-[#FFE5D9] mb-4">
          <Image
            src={avatarUrl || "/Pic.png"}
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
          Change Photo
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 mb-8">
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
      </div>

      {/* Save Button */}
      <Button
        className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-4 rounded-xl disabled:opacity-50"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}
