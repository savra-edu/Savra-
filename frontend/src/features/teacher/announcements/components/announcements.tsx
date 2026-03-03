"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Announcement {
  id: number
  title: string
  subject: string
  teacherName: string
  timestamp: string
  content: string
}

interface AnnouncementProps {
  isOpen: boolean
  announcement: Announcement | null
  onClose: () => void
}

export function AnnouncementsDialog({ isOpen, announcement, onClose }: AnnouncementProps) {
  if (!announcement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-w-[calc(100%-12rem)] max-h-[70vh] p-0 gap-0 border-0 rounded-2xl overflow-hidden flex flex-col">
        <div className="relative bg-white p-8 flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-4 leading-tight pr-10">
              {announcement.title}
            </DialogTitle>
          </DialogHeader>

          {/* Header Section with Title and Timestamp */}
          <div className="pr-10 mb-6 flex-shrink-0">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {announcement.subject} | {announcement.teacherName}
              </p>
              <p className="text-sm text-gray-500">{announcement.timestamp}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px rounded-lg bg-[#F6F6F6] mb-6 flex-shrink-0" />

          {/* Content Body - Scrollable */}
          <div className="flex-1 overflow-y-auto mb-8 bg-gray-50 p-6 rounded-lg min-h-0">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{announcement.content}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-4">{announcement.content}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-4">{announcement.content}</p>
          </div>

          {/* Done Button - Bottom Right */}
          <div className="flex justify-end pt-2 flex-shrink-0">
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
