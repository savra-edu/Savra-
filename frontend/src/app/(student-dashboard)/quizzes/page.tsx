"use client"

import { useState, useCallback } from "react"
import QuizDashboard from "@/features/student/quiz/components/quiz-dashboard"
import QuizHeader from "@/features/student/quiz/components/quiz-header"

export default function QuizzesPage() {
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const handleSubjectChange = useCallback((value: string | undefined) => {
    setSubjectId(value)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
      <QuizHeader
        onSubjectChange={handleSubjectChange}
        onSearchChange={handleSearchChange}
      />
      <QuizDashboard
        subjectId={subjectId}
        searchQuery={searchQuery}
      />
    </div>
  )
}
