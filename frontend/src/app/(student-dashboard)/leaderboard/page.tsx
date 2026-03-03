"use client"

import { useState, useCallback } from "react"
import LeaderboardStandings from "@/features/student/leaderboard/components/leaderboard-standings"
import LeaderboardHeader from "@/features/student/leaderboard/components/leaderboard-header"
import { useStudentClass } from "@/hooks/use-student"

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: studentClass } = useStudentClass()

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="flex flex-col p-4 lg:p-8 max-w-full h-full">
      <LeaderboardHeader onSearchChange={handleSearchChange} studentClass={studentClass} />
      <div className="flex-1 min-h-0 mt-4 lg:mt-6">
        <LeaderboardStandings searchQuery={searchQuery} />
      </div>
    </div>
  )
}
