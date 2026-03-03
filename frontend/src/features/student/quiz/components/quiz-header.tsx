"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search } from "lucide-react"
import { StudentFilterBar } from "@/components/student-filter-bar"
import { useStudentClass, useStudentSubjects as useCachedStudentSubjects } from "@/hooks/use-student"

interface QuizHeaderProps {
  onSubjectChange?: (subjectId: string | undefined) => void
  onSearchChange?: (query: string) => void
}

export default function QuizHeader({ onSubjectChange, onSearchChange }: QuizHeaderProps) {
  const [searchValue, setSearchValue] = useState("")
  const { data: studentClass, isLoading: classLoading } = useStudentClass()
  const { data: subjects, isLoading: subjectsLoading } = useCachedStudentSubjects()

  // Build subject options with "All Subjects" first
  const subjectOptions = useMemo(() => [
    { id: undefined as string | undefined, name: "All Subjects" },
    ...(subjects || [])
  ], [subjects])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])

  const handleSubjectChange = useCallback((value: string) => {
    const subject = subjectOptions.find(s => s.name === value)
    onSubjectChange?.(subject?.id)
  }, [onSubjectChange, subjectOptions])

  // Get class display
  const classDisplay = studentClass
    ? `${studentClass.grade}${studentClass.section ? `-${studentClass.section}` : ""}`
    : "Class"

  return (
    <div className="flex flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
      <div className="flex flex-col">
        <h1 className="text-base lg:text-2xl font-bold text-[#242220]">Quizzes</h1>
        {studentClass && (
          <span className="text-xs lg:text-sm text-gray-600">
            Class {studentClass.grade}{studentClass.section ? `-${studentClass.section}` : ''} Assignments
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
                placeholder="Search quizzes..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base placeholder:text-gray-400 text-black"
              />
            </div>
          </div>
        </div>
        <StudentFilterBar
          onSubjectChange={handleSubjectChange}
          classDisplay={classDisplay}
          subjects={subjectOptions.map(s => s.name)}
          isLoading={subjectsLoading}
        />
      </div>
    </div>
  )
}
