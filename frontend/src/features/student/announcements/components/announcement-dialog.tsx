"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Announcement, useMarkAnnouncementRead } from "@/hooks/use-announcements"

// Format timestamp to readable string
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface AnnouncementDialogProps {
  isOpen: boolean
  announcement: Announcement | null
  onClose: () => void
}

export function AnnouncementDialog({ isOpen, announcement, onClose }: AnnouncementDialogProps) {
  // Mark as read when dialog opens
  const { isLoading: isMarkingRead } = useMarkAnnouncementRead(
    isOpen && announcement ? announcement.id : null
  )

  if (!announcement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-8rem)] max-h-[90vh] p-6 gap-0 border-0 rounded-2xl overflow-hidden">
        <div className="relative bg-white p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 mb-4 leading-tight pr-10">
              {announcement.title}
            </DialogTitle>
          </DialogHeader>

          {/* Header Section with Teacher and Timestamp */}
          <div className="pr-10 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{announcement.teacherName}</p>
              <p className="text-sm text-gray-500">{formatTimestamp(announcement.createdAt)}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px rounded-lg bg-[#F6F6F6] mb-6" />

          {/* Content Body */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {announcement.content}
            </p>
          </div>

          {/* Attachment Link (if available) */}
          {announcement.attachmentUrl && (
            <div className="mb-6">
              <a
                href={announcement.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#9B61FF] hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Attachment
              </a>
            </div>
          )}

          {/* Done Button - Bottom Right */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={onClose}
              className="px-8 py-2.5 border border-[#DF6647] text-[#DF6647] bg-white rounded-lg font-semibold hover:bg-[#DF6647]/10 transition-colors"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
