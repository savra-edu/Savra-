"use client"

import { useState, useCallback } from "react"
import AnnouncementDashboard from "@/features/student/announcements/components/announcement-dashboard"
import AnnouncementHeader from "@/features/student/announcements/components/announcement-header"
import { useStudentClass } from "@/hooks/use-student"

export default function AnnouncementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: studentClass } = useStudentClass()

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="flex flex-col p-8 max-w-full h-full">
      <AnnouncementHeader onSearchChange={handleSearchChange} studentClass={studentClass} />
      <div className="flex-1 min-h-0">
        <AnnouncementDashboard searchQuery={searchQuery} />
      </div>
    </div>
  )
}
