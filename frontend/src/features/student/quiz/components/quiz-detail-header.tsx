"use client"

import Link from "next/link"
import StudentSearchBar from "@/components/student-search-bar"
import { StudentFilterBar } from "@/components/student-filter-bar"
import { ChevronLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuizDetailHeaderProps {
  currentQuestion?: number
  totalQuestions?: number
  onEndQuiz?: () => void
  quizTitle?: string
  timeRemaining?: number | null
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function QuizHeader({
  currentQuestion,
  totalQuestions,
  onEndQuiz,
  quizTitle = "Quiz",
  timeRemaining,
}: QuizDetailHeaderProps) {
  const isTimeWarning = timeRemaining !== null && timeRemaining !== undefined && timeRemaining < 60

  return (
    <div className="flex flex-col border-b border-gray-200 pb-4 lg:pb-6">
      {/* Top Row: Back + Title + Timer + End Quiz Button */}
      <div className="flex items-center justify-between mb-3 lg:mb-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <Link href="/quizzes">
            <ChevronLeft className="w-6 h-6 lg:w-12 lg:h-12 text-black rounded-full p-1 lg:p-4 bg-[#F5F5F5] cursor-pointer hover:opacity-70 transition-opacity" />
          </Link>
          <h1 className="text-lg lg:text-3xl font-bold text-[#242220]">{quizTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Timer Display */}
          {timeRemaining !== null && timeRemaining !== undefined && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isTimeWarning ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm lg:text-base">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          <div className="hidden lg:flex items-center gap-4">
            <StudentSearchBar />
            <StudentFilterBar />
          </div>
          {onEndQuiz && (
            <Button
              onClick={onEndQuiz}
              className="lg:hidden border-2 border-[#DF6647] text-[#DF6647] bg-white hover:bg-[#DF6647]/10 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              End Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Question Info Row - Mobile Only */}
      {currentQuestion && totalQuestions && (
        <div className="lg:hidden flex items-center justify-between">
          <span className="text-sm font-medium text-[#353535]">Question {currentQuestion}</span>
          <span className="text-sm font-medium text-[#353535]">
            {currentQuestion}/{totalQuestions}
          </span>
        </div>
      )}
    </div>
  )
}
