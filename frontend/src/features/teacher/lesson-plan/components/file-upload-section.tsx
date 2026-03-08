"use client"

import type React from "react"
import { useRef } from "react"

import { Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void
  uploadedFileName?: string
}

export function FileUploadSection({ onFileUpload, uploadedFileName }: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      
      // Validate file type (allow common document types)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not supported. Please upload PDF, Word, or image files.`)
        e.target.value = '' // Reset input
        return
      }
      
      onFileUpload(file)
    }
  }

  const handlePhotoCapture = () => {
    // Handle photo capture logic
    console.log("Take photo")
  }

  return (
    <div className="flex flex-row gap-3">
      <div className="relative flex-1">
        <input 
          ref={fileInputRef}
          type="file" 
          id="file-upload" 
          onChange={handleFileChange} 
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#B595FF] hover:bg-[#A085EF] text-white px-4 py-3 lg:px-6 lg:py-6 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2 w-full"
        >
          <Upload className="w-4 h-4" />
          Upload a File
        </Button>
      </div>
      <Button
        onClick={handlePhotoCapture}
        className="flex-1 bg-[#B595FF] hover:bg-[#A085EF] text-white px-4 py-3 lg:px-6 lg:py-6 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2 lg:hidden"
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </Button>
      {uploadedFileName && <p className="mt-2 text-sm text-gray-600">Uploaded: {uploadedFileName}</p>}
    </div>
  )
}
