"use client"

import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnnouncementDialog } from "./announcement-dialog"
import { useStudentAnnouncementsPaginated, Announcement } from "@/hooks/use-announcements"

interface AnnouncementDashboardProps {
  searchQuery?: string
}

// Format timestamp to relative string
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  if (diffDays === 0) {
    return `Today, ${timeStr}`
  } else if (diffDays === 1) {
    return `Yesterday, ${timeStr}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago, ${timeStr}`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
}

// Check if date is within time range
function isWithinTimeRange(dateString: string, range: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  switch (range) {
    case "Today":
      return date >= startOfDay
    case "This Week":
      return diffDays < 7
    case "This Month":
      return diffDays < 30
    default:
      return true
  }
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-4 lg:border-b lg:border-gray-200 lg:rounded-none lg:bg-transparent lg:pb-4 lg:mb-4"
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mt-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnnouncementDashboard({ searchQuery = "" }: AnnouncementDashboardProps) {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: announcements, isLoading, error, pagination } = useStudentAnnouncementsPaginated(page, limit)

  const [sortBy, setSortBy] = useState<string>("All")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter announcements by sort and search
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []

    let filtered = announcements

    // Apply time-based filter
    if (sortBy !== "All") {
      filtered = filtered.filter((a) => isWithinTimeRange(a.createdAt, sortBy))
    }

    // Apply search filter (client-side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.teacherName.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [announcements, sortBy, searchQuery])

  const handleRowClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedAnnouncement(null)
  }

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1)
  }

  // Error state
  if (error) {
    return (
      <div className="lg:border lg:border-black lg:rounded-lg w-full flex flex-col h-full p-2 lg:bg-white overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Failed to load announcements. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:border lg:border-black lg:rounded-lg w-full flex flex-col h-full p-2 lg:bg-white overflow-hidden">
      {/* Header Section */}
      <div className="hidden lg:flex flex-row justify-between items-center px-6 py-4 flex-shrink-0 border-b border-gray-300">
        <div>
          <h1 className="text-sm font-normal text-[#353535]">
            {pagination ? `${pagination.total} announcements` : "All"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-[#353535]">sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Sort Section */}
      <div className="lg:hidden flex justify-end items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-[#353535]">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="lg:p-6 space-y-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredAnnouncements.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">
                {searchQuery ? "No announcements match your search" : "No announcements yet"}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => handleRowClick(announcement)}
                className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors lg:border-b lg:border-gray-200 lg:rounded-none lg:bg-transparent lg:pb-4 lg:mb-4 lg:last:border-b-0 lg:last:mb-0 lg:hover:bg-[#F5F0FA]"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-gray-900 font-bold text-base flex-1">{announcement.title}</h3>
                    <p className="text-gray-500 text-sm whitespace-nowrap">
                      {announcement.teacherName}, {formatTimestamp(announcement.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === pagination.totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <AnnouncementDialog
        isOpen={isDialogOpen}
        announcement={selectedAnnouncement}
        onClose={handleDialogClose}
      />
    </div>
  )
}
