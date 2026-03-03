"use client"

import { useState, useEffect, useMemo } from "react"
import { QuestionHeader } from "./question-header"
import { QuestionContent } from "./question-content"
import { AnswerOptions } from "./answer-options"
import { ProgressSidebar } from "./progress-sidebar"
import { QuizActions } from "./quiz-actions"
import { QuizQuestion } from "@/hooks/use-quiz"

interface QuizPageProps {
  questions: QuizQuestion[]
  onQuestionChange?: (question: number) => void
  onAnswerSelect?: (questionId: string, selectedOptionId: string | null) => void
  onSubmit?: () => void
  isSaving?: boolean
}

export default function QuizPage({
  questions,
  onQuestionChange,
  onAnswerSelect,
  onSubmit,
  isSaving = false,
}: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1)

  // Track local selection for immediate UI feedback
  const [localSelections, setLocalSelections] = useState<Record<string, string | null>>({})

  // Build question status from both API data and local selections
  const questionStatus = useMemo(() => {
    const status: Record<number, "marked" | "skipped" | "unanswered"> = {}
    questions.forEach((q, index) => {
      const questionNum = index + 1
      // Check both API data and local selections for answered status
      const hasAnswer =
        q.submittedAnswer?.selectedOptionId ||
        q.submittedAnswer?.answerText ||
        localSelections[q.id]

      if (hasAnswer) {
        status[questionNum] = "marked"
      } else {
        status[questionNum] = "unanswered"
      }
    })
    return status
  }, [questions, localSelections])

  // Initialize local selections from API data
  useEffect(() => {
    const selections: Record<string, string | null> = {}
    questions.forEach((q) => {
      if (q.submittedAnswer?.selectedOptionId) {
        selections[q.id] = q.submittedAnswer.selectedOptionId
      }
    })
    setLocalSelections(selections)
  }, [questions])

  const currentQuestionData = questions[currentQuestion - 1]
  const totalQuestions = questions.length

  // Transform API options to component format
  const transformedOptions = currentQuestionData?.options.map((opt) => ({
    id: opt.id,
    label: opt.optionLabel,
    value: opt.optionText,
  })) || []

  // Get current selection (prefer local for immediate feedback)
  const currentSelection = localSelections[currentQuestionData?.id] ||
    currentQuestionData?.submittedAnswer?.selectedOptionId ||
    null

  const handleSelectAnswer = (answerId: string) => {
    if (!currentQuestionData) return

    // Toggle selection
    const newSelection = answerId === currentSelection ? null : answerId

    // Update local state for immediate feedback
    setLocalSelections((prev) => ({
      ...prev,
      [currentQuestionData.id]: newSelection,
    }))

    // Call parent to save to backend
    onAnswerSelect?.(currentQuestionData.id, newSelection)
  }

  const handleSkip = () => {
    if (currentQuestion < totalQuestions) {
      const newQuestion = currentQuestion + 1
      setCurrentQuestion(newQuestion)
      onQuestionChange?.(newQuestion)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      const newQuestion = currentQuestion - 1
      setCurrentQuestion(newQuestion)
      onQuestionChange?.(newQuestion)
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      const newQuestion = currentQuestion + 1
      setCurrentQuestion(newQuestion)
      onQuestionChange?.(newQuestion)
    }
  }

  const handleSubmit = () => {
    onSubmit?.()
  }

  const handleEndQuiz = () => {
    onSubmit?.()
  }

  const handleQuestionClick = (questionNumber: number) => {
    setCurrentQuestion(questionNumber)
    onQuestionChange?.(questionNumber)
  }

  if (!currentQuestionData) {
    return (
      <div className="w-full mt-4 lg:mt-6 pb-20 lg:pb-0">
        <div className="text-center py-8 text-gray-500">
          No questions available.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mt-4 lg:mt-6 pb-20 lg:pb-0">
      <QuestionHeader currentQuestion={currentQuestion} totalQuestions={totalQuestions} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white lg:bg-[#FCF7FE] rounded-xl p-4 lg:p-6">
            <QuestionContent
              label={`Question ${currentQuestion}`}
              text={currentQuestionData.questionText}
            />
            <AnswerOptions
              options={transformedOptions}
              selectedAnswer={currentSelection}
              onSelectAnswer={handleSelectAnswer}
              isLoading={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <QuizActions
            onSkip={handleSkip}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isFirstQuestion={currentQuestion === 1}
            isLastQuestion={currentQuestion === totalQuestions}
          />
        </div>

        {/* Progress Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1">
          <ProgressSidebar
            questionStatus={questionStatus}
            currentQuestion={currentQuestion}
            onQuestionClick={handleQuestionClick}
            onEndQuiz={handleEndQuiz}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    </div>
  )
}
