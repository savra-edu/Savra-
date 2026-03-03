"use client"

import { Loader2 } from "lucide-react"

interface Option {
  id: string
  label: string
  value: string
}

interface AnswerOptionsProps {
  options: Option[]
  selectedAnswer: string | null
  onSelectAnswer: (answerId: string) => void
  isLoading?: boolean
}

export function AnswerOptions({
  options,
  selectedAnswer,
  onSelectAnswer,
  isLoading = false,
}: AnswerOptionsProps) {
  const handleClick = (optionId: string) => {
    if (isLoading) return
    if (selectedAnswer === optionId) {
      onSelectAnswer("")
    } else {
      onSelectAnswer(optionId)
    }
  }

  return (
    <div className="space-y-3 mt-6 relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="w-6 h-6 text-[#9B61FF] animate-spin" />
        </div>
      )}

      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleClick(option.id)}
          disabled={isLoading}
          className={`w-full flex items-center gap-4 p-3 lg:p-2 rounded-lg border-2 transition-all ${
            selectedAnswer === option.id
              ? "border-[#9B61FF] bg-[#F5F0FA] lg:bg-white text-black"
              : "border-gray-300 lg:border-[#9B61FF]/30 bg-white lg:bg-[#FCF7FE] hover:border-[#9B61FF]/50"
          } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 text-sm font-semibold ${
              selectedAnswer === option.id
                ? "bg-[#9B61FF] text-white"
                : "bg-gray-200 lg:bg-[#9B61FF]/20 text-gray-700 lg:text-[#9B61FF]"
            }`}
          >
            {option.label}
          </div>
          <span className="text-base lg:text-xl font-medium text-gray-800">{option.value}</span>
        </button>
      ))}
    </div>
  )
}
