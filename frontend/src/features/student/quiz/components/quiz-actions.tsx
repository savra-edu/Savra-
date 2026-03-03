"use client"

import { Button } from "@/components/ui/button"

interface QuizActionsProps {
  onSkip: () => void
  onPrevious: () => void
  onNext: () => void
  onSubmit?: () => void
  isFirstQuestion: boolean
  isLastQuestion: boolean
}

export function QuizActions({ 
  onSkip, 
  onPrevious, 
  onNext, 
  onSubmit,
  isFirstQuestion, 
  isLastQuestion 
}: QuizActionsProps) {
  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white flex items-center justify-between z-[60]">
        <div className="flex-1">
          <Button
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className={`px-6 py-3 w-42 md:w-56 rounded-lg font-semibold transition-colors ${
              isFirstQuestion
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <Button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border-2 border-[#DF6647] text-[#DF6647] bg-white rounded-lg font-semibold hover:bg-[#DF6647]/10 transition-colors"
          >
            Skip
          </Button>
          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              className="flex-1 px-6 py-3 bg-[#DF6647] text-white rounded-lg font-semibold hover:bg-[#DF6647]/90 transition-colors"
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="flex-1 px-6 py-3 bg-[#DF6647] text-white rounded-lg font-semibold hover:bg-[#DF6647]/90 transition-colors"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-4 justify-between mt-8">
        <Button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`px-6 py-4 rounded-md hover:bg-[#DF6647]/80 font-semibold transition-colors ${
            isFirstQuestion
              ? "bg-[#DDDAD9] text-[#6D6D6D] cursor-not-allowed"
              : "bg-[#DDDAD9] text-[#FFFFFF] bg-[#DF6647]/80"
          }`}
        >
          Previous Question
        </Button>

        <div className="flex gap-4">
          <Button
            onClick={onSkip}
            className="px-6 py-3 border-2 border-[#DF6647] text-[#DF6647] bg-white rounded-lg font-semibold hover:bg-[#DF6647]/10 transition-colors"
          >
            Skip
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              className="px-8 py-3 bg-[#DF6647] text-white rounded-lg font-semibold hover:bg-[#DF6647]/80 transition-colors"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="px-8 py-3 bg-[#DF6647] text-white rounded-lg font-semibold hover:bg-[#DF6647]/80 transition-colors"
            >
              Next question
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
