"use client"

import Link from "next/link"
import { DownloadDropdown } from "@/components/download-dropdown"
import { useContentDownload } from "@/hooks/use-content-download"

interface LessonCardProps {
  id: string
  type: "Lesson" | "Quiz"
  subject: string
  status: "Saved" | "Draft" | "Published"
  date?: string
  duration?: string
  classCode: string
}

export default function LessonCard({
  id,
  type,
  subject,
  status,
  date,
  duration,
  classCode,
}: LessonCardProps) {
  const { handleDownloadPDF, handleDownloadWord, canDownload } = useContentDownload(id)

  return (
    <Link
      href={`/home/see-all/${id}`}
      className="relative bg-[#FFFFFF] rounded-2xl p-6 border border-[#DFDFDF33] shadow-sm block hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-0 right-0">
        <span
          className={`px-3 py-2 rounded-md text-xs font-medium ${
            status === "Published"
              ? "bg-[#D4EDDA] text-[#155724]"
              : status === "Saved"
              ? "bg-[#EFFBE1] text-[#353535]"
              : "bg-[#FEEBD4] text-[#353535]"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Top Section */}
      <div className="mb-6 pr-20">
        <p className="text-sm text-[#727272] mb-1">{type}</p>
        <h3 className="text-xl font-semibold text-[#353535] mb-4">{subject}</h3>

        {date && (
          <div>
            <p className="text-sm text-[#727272] mb-0.5">Date</p>
            <p className="text-lg font-medium text-[#353535]">{date}</p>
          </div>
        )}
        {duration && !date && (
          <div>
            <p className="text-sm text-[#727272] mb-0.5">Duration</p>
            <p className="text-lg font-medium text-[#353535]">{duration}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5E5] mb-4"></div>

      {/* Bottom Section */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-medium text-[#353535]">{classCode}</p>
        </div>
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="flex items-center"
        >
          <DownloadDropdown
            onDownloadPDF={canDownload ? handleDownloadPDF : () => {}}
            onDownloadWord={canDownload ? handleDownloadWord : () => {}}
            label=""
            compact
            className="h-8 w-8 p-0 min-w-0 border-0 bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          />
        </div>
      </div>
    </Link>
  )
}
