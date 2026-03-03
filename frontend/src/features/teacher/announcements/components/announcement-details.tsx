"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AnnouncementsDialog } from "./announcements"
import { AnnouncementsDialog as AddAnnouncementDialog } from "./add-announcement-dialog"
import { useFetch } from "@/hooks/use-api"

interface Announcement {
  id: string
  title: string
  content: string
  attachmentUrl?: string
  class?: { id: string; name: string; grade: number; section: string }
  createdAt: string
}

interface AnnouncementsResponse {
  announcements: Announcement[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type MessageItem = {
  id: string
  title: string
  description: string
  metadata: string
}

export default function AnnouncementDetails() {
  const [activeTab, setActiveTab] = useState<"sent" | "draft">("sent")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    id: number
    title: string
    subject: string
    teacherName: string
    timestamp: string
    content: string
  } | null>(null)

  // Fetch announcements from API
  const { data: response, isLoading, error, refetch } = useFetch<AnnouncementsResponse>(
    `/announcements`
  )
  const announcements = response?.announcements || []

  const parseMetadata = (metadata: string) => {
    // Parse "Social Science 7-B, Today, 19:30" or "8-B, Today, 19:30"
    const parts = metadata.split(",").map((p) => p.trim())
    let subject = ""
    let classInfo = ""
    let date = ""
    let time = ""

    if (parts.length >= 3) {
      // Format: "Subject Class, Date, Time" or "Class, Date, Time"
      const firstPart = parts[0]
      if (firstPart.includes("-")) {
        // Has class info, check if it has subject
        const firstPartSplit = firstPart.split(" ")
        if (firstPartSplit.length > 1) {
          // Has subject
          subject = firstPartSplit.slice(0, -1).join(" ")
          classInfo = firstPartSplit[firstPartSplit.length - 1]
        } else {
          classInfo = firstPart
        }
      } else {
        subject = firstPart
      }
      date = parts[1] || ""
      time = parts[2] || ""
    }

    return { subject, classInfo, date, time, fullTimestamp: `${date}, ${time}` }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString()}, ${timeStr}`
  }

  const handleAnnouncementClick = (announcement: Announcement) => {
    const className = announcement.class
      ? `${announcement.class.grade}-${announcement.class.section}`
      : "All Classes"
    setSelectedAnnouncement({
      id: parseInt(announcement.id),
      title: announcement.title,
      subject: className,
      teacherName: "You", // Since it's the teacher's own announcement
      timestamp: formatTimestamp(announcement.createdAt),
      content: announcement.content,
    })
  }

  // Transform API data to MessageItem format
  const messages: MessageItem[] = announcements.map((announcement) => {
    const className = announcement.class
      ? `${announcement.class.grade}-${announcement.class.section}`
      : "All"
    return {
      id: announcement.id,
      title: announcement.title,
      description: announcement.content,
      metadata: `${className}, ${formatTimestamp(announcement.createdAt)}`,
    }
  })

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    refetch() // Refresh the list after creating a new announcement
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Section */}
      <div className="flex items-center gap-2 mb-4 lg:mb-6">
        {/* Sent Tab */}
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "sent"
              ? "bg-[#9B61FF] text-white"
              : "bg-white border-2 border-[#9B61FF] text-[#9B61FF]"
          }`}
        >
          Sent
        </button>

        {/* Draft Tab */}
        <button
          onClick={() => setActiveTab("draft")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "draft"
              ? "bg-[#9B61FF] text-white"
              : "bg-white border-2 border-[#9B61FF] text-[#9B61FF]"
          }`}
        >
          Drafts
        </button>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#9B61FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No {activeTab === "sent" ? "sent" : "draft"} announcements yet.</p>
          </div>
        )}

        {/* Message List */}
        {!isLoading && !error && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((message) => {
              const { classInfo, date, time } = parseMetadata(message.metadata)
              const metadataText = classInfo ? `${classInfo}, ${date}, ${time}` : message.metadata

              return (
                <div
                  key={message.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const announcement = announcements?.find(a => a.id === message.id)
                    if (announcement) handleAnnouncementClick(announcement)
                  }}
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-gray-900 font-bold text-base flex-1">{message.title}</h3>
                    <p className="text-gray-500 text-sm whitespace-nowrap flex-shrink-0">{metadataText}</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{message.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create New Button - Fixed at bottom on mobile */}
      <div className="lg:hidden flex-shrink-0 pt-4 mt-4 border-t border-gray-200">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white py-6 rounded-xl font-semibold text-base"
        >
          Create New
        </Button>
      </div>

      {/* Desktop Create New Button */}
      <div className="hidden lg:block mt-6">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white px-6 py-4 rounded-lg font-semibold"
        >
          Create New
        </Button>
      </div>

      {/* Add Announcement Dialog */}
      <AddAnnouncementDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* View Announcement Dialog */}
      <AnnouncementsDialog
        isOpen={selectedAnnouncement !== null}
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  )
}
