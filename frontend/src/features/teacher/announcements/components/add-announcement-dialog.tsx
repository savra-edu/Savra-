"use client"

import { useState, useMemo } from "react"
import { X, Sparkles, Upload, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useTeacherClasses } from "@/hooks/use-classes"

interface AnnouncementsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementsDialog({ open, onOpenChange }: AnnouncementsDialogProps) {
  const { data: classes, isLoading: classesLoading } = useTeacherClasses()
  const [selectedClassId, setSelectedClassId] = useState("")
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedClass = classes?.find(c => c.id === selectedClassId)

  const isFormValid = useMemo(() => {
    return selectedClassId !== "" && (heading.trim().length > 0 || body.trim().length > 0)
  }, [selectedClassId, heading, body])

  const resetForm = () => {
    setSelectedClassId("")
    setHeading("")
    setBody("")
    setUploadedFile(null)
    setError(null)
  }

  const handleSaveDraft = async () => {
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    try {
      // Upload file if present
      let attachmentUrl: string | undefined
      if (uploadedFile) {
        try {
          const formData = new FormData()
          formData.append("file", uploadedFile)
          const uploadResult = await api.upload<{ success: boolean; data: { url: string } }>("/upload/file", formData)
          if (uploadResult.success && uploadResult.data?.url) {
            attachmentUrl = uploadResult.data.url
            console.log('File uploaded successfully:', attachmentUrl)
          } else {
            console.warn('Upload response missing URL:', uploadResult)
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError)
          setError('Failed to upload file. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Create announcement
      await api.post("/announcements", {
        classId: selectedClassId,
        title: heading,
        content: body,
        attachmentUrl,
      })

      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    try {
      // Upload file if present
      let attachmentUrl: string | undefined
      if (uploadedFile) {
        try {
          const formData = new FormData()
          formData.append("file", uploadedFile)
          const uploadResult = await api.upload<{ success: boolean; data: { url: string } }>("/upload/file", formData)
          if (uploadResult.success && uploadResult.data?.url) {
            attachmentUrl = uploadResult.data.url
            console.log('File uploaded successfully:', attachmentUrl)
          } else {
            console.warn('Upload response missing URL:', uploadResult)
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError)
          setError('Failed to upload file. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Create and send announcement
      await api.post("/announcements", {
        classId: selectedClassId,
        title: heading,
        content: body,
        attachmentUrl,
      })

      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send announcement")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert(`File size exceeds 10MB limit. Please choose a smaller file.`)
        e.target.value = '' // Reset input
        return
      }
      setUploadedFile(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-w-[calc(100%-4rem)] p-0 gap-0 bg-white rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Announcements</DialogTitle>
          </div>

          {/* Class Select */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={classesLoading}
              className="appearance-none bg-[#9B61FF] text-white font-semibold px-4 py-2 pr-8 rounded-md cursor-pointer hover:bg-[#8B51EF] transition-colors focus:outline-none"
            >
              <option value="">
                {classesLoading ? "Loading..." : "Select Class"}
              </option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Class: {cls.grade} {cls.section}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Heading Section */}
          <div>
            <label className="block text-sm font-medium text-[#353535] mb-2">Heading</label>
            <Input
              placeholder="Type here"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-3 border border-[#C4C4C4]"
            />
          </div>

          {/* Body Section */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 bg-[#EFE9F8] border border-[#F6F6F9] rounded-t-lg">
              <label className="block text-sm  font-medium text-gray-900">Body of the Notice</label>
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <Sparkles size={20} />
              </button>
            </div>
            <textarea
              placeholder="Start Typing..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-b-lg bg-white"
              rows={6}
            />
          </div>

          {/* Upload Section */}
          <div className="mt-4 flex flex-wrap items-center justify-between">
            <div className="flex flex-col items-center gap-2">
                <label className="block text-sm font-medium text-gray-900">Upload Reference Material</label>
                <label className="w-full flex items-center justify-center gap-2 bg-[#9B61FF] hover:bg-[#9B61FF]/90 text-white px-2 py-2 rounded-lg transition-colors cursor-pointer">
                  <Upload size={20} />
                  {uploadedFile ? uploadedFile.name : "Upload a File"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
            </div>


          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              disabled={!isFormValid || isLoading}
              className="px-6 py-2 border-2 border-orange-400 text-orange-400 hover:bg-orange-50 rounded-lg font-medium bg-transparent disabled:opacity-50"
              onClick={handleSaveDraft}
            >
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              disabled={!isFormValid || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isFormValid && !isLoading
                  ? "bg-[#DF6647] hover:bg-orange-600 text-white shadow-md"
                  : "bg-[#B5B5B5] text-white cursor-not-allowed"
              }`}
              onClick={handleSend}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
