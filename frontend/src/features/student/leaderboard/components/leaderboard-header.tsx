"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { StudentFilterBar } from "@/components/student-filter-bar"

interface StudentClass {
  id: string
  name: string
  grade: number | string
  section?: string
}

interface LeaderboardHeaderProps {
  onSearchChange?: (query: string) => void
  studentClass?: StudentClass | null
}

export default function LeaderboardHeader({ onSearchChange, studentClass }: LeaderboardHeaderProps) {
  const [searchValue, setSearchValue] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])

  return (
    <div className="flex flex-row justify-between items-center gap-4 border-b border-gray-200 pb-4 lg:pb-6">
      <div className="flex flex-col">
        <h1 className="text-base lg:text-3xl font-bold text-[#242220]">Leaderboard</h1>
        {studentClass && (
          <span className="text-xs lg:text-sm text-gray-600">
            Class {studentClass.grade}{studentClass.section ? `-${studentClass.section}` : ''} Rankings
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Search Bar - Desktop Only */}
        <div className="hidden lg:block">
          <div className="relative w-full sm:w-sm">
            <div className="relative flex items-center px-4 sm:px-8 py-2 rounded-3xl border border-[#C7B1EE]">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 sm:mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base placeholder:text-gray-400 text-black"
              />
            </div>
          </div>
        </div>
        <StudentFilterBar />
      </div>
    </div>
  )
}
