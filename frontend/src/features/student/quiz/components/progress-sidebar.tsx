"use client"

import { Button } from "@/components/ui/button"

interface ProgressSidebarProps {
  questionStatus: Record<number, "marked" | "skipped" | "unanswered">
  currentQuestion: number
  onQuestionClick?: (questionNumber: number) => void
  onEndQuiz?: () => void
  totalQuestions?: number
}

export function ProgressSidebar({
  questionStatus,
  currentQuestion,
  onQuestionClick,
  onEndQuiz,
  totalQuestions = 8,
}: ProgressSidebarProps) {
  const answeredCount = Object.values(questionStatus).filter((s) => s === "marked").length

  const getStatusBoxStyle = (status: "marked" | "skipped" | "unanswered") => {
    if (status === "marked") {
      return "bg-green-100 text-gray-700"
    } else if (status === "skipped") {
      return "bg-yellow-100 text-gray-700"
    } else {
      return "bg-white text-gray-400"
    }
  }

  const getStatusText = (status: "marked" | "skipped" | "unanswered", num: number) => {
    if (status === "marked") {
      return "Answered"
    } else if (status === "skipped") {
      return "Skipped"
    } else {
      return num.toString()
    }
  }

  const getCircleStyle = (num: number, status: "marked" | "skipped" | "unanswered") => {
    if (num === currentQuestion) {
      return "bg-[#9B61FF] text-white"
    } else if (status === "marked") {
      return "bg-[#9B61FF] text-white"
    } else if (status === "skipped") {
      return "bg-yellow-200 text-gray-700"
    } else {
      return "bg-gray-200 text-gray-500"
    }
  }

  return (
    <div className="bg-[#FCF7FE] rounded-lg p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Progress</h3>

      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
          const status = questionStatus[num] || "unanswered"
          return (
            <div key={num} className="flex items-center gap-3">
              <button
                onClick={() => onQuestionClick?.(num)}
                className={`flex items-center justify-center w-10 h-10 rounded-md font-semibold text-sm flex-shrink-0 transition-all ${getCircleStyle(
                  num,
                  status
                )}`}
              >
                {num}
              </button>
              <div
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${getStatusBoxStyle(
                  status
                )}`}
              >
                {getStatusText(status, num)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-300 mb-4">
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#9B61FF]"></div>
          <span className="text-sm font-medium">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <Button
          onClick={onEndQuiz}
          className="w-full border-2 border-[#DF6647] text-[#DF6647] bg-white hover:bg-[#DF6647]/10 font-semibold"
        >
          End Quiz
        </Button>
      </div>
    </div>
  )
}
