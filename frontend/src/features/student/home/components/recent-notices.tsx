"use client"

import { ChevronRight, Send } from "lucide-react"
import { useStudentAnnouncements } from "@/hooks/use-student"

// Loading skeleton for notices
function NoticeSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
    </div>
  )
}

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "2-digit"
  })
}

export function RecentNotices() {
  const { data: announcements, isLoading, error } = useStudentAnnouncements(3)

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
      <h2 className="text-base font-normal text-[#353535] mb-6">Recent Notices</h2>
      <div className="space-y-4">
        {isLoading ? (
          <>
            <NoticeSkeleton />
            <NoticeSkeleton />
            <NoticeSkeleton />
          </>
        ) : error ? (
          <div className="text-center py-4 text-gray-500">
            Failed to load notices.
          </div>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((notice) => (
            <div
              key={notice.id}
              className="flex items-center gap-4 p-4 bg-[#FCF7FD] text-[#353535] rounded-lg hover:bg-[#F7EDFC]/80 transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5 text-[#000000] flex-shrink-0" strokeWidth={1.15} />
              <div className="flex-1 min-w-0">
                <p className="text-[#353535] font-normal text-base truncate">{notice.title}</p>
                <p className="text-[#353535] text-sm font-normal">
                  {notice.subject?.name || "General"} | {formatDate(notice.createdAt)}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No recent notices.
          </div>
        )}
      </div>
    </div>
  )
}
