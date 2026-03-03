"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import QuizDetailHeader from "@/features/student/quiz/components/quiz-detail-header"
import QuizPage from "@/features/student/quiz/components/quiz-questions"
import {
  useQuizDetails,
  useStartQuizAttempt,
  useQuizAttempt,
  useSaveAnswer,
  useSubmitQuiz,
  QuizQuestion,
} from "@/hooks/use-quiz"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function QuizDetailPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch quiz details
  const { data: quizDetails, isLoading: detailsLoading, error: detailsError } = useQuizDetails(quizId)

  // Start attempt mutation
  const { mutate: startAttempt, isLoading: startingAttempt } = useStartQuizAttempt(quizId)

  // Fetch questions for attempt
  const { data: attemptData, isLoading: questionsLoading } = useQuizAttempt(
    quizId,
    attemptId
  )

  // Save answer hook
  const { saveAnswer, isLoading: savingAnswer } = useSaveAnswer(quizId, attemptId || "")

  // Submit quiz hook
  const { mutate: submitQuiz, isLoading: submittingQuiz } = useSubmitQuiz(quizId, attemptId || "")

  // Check for existing attempts or start new one
  useEffect(() => {
    if (quizDetails && !attemptId) {
      if (quizDetails.inProgressAttempt) {
        // Resume existing in-progress attempt
        setAttemptId(quizDetails.inProgressAttempt.id)

        // Calculate remaining time if there's a time limit
        if (quizDetails.timeLimit) {
          const startTime = new Date(quizDetails.inProgressAttempt.startedAt).getTime()
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const remaining = quizDetails.timeLimit * 60 - elapsed
          setTimeRemaining(Math.max(0, remaining))
        }
      } else if (quizDetails.latestCompletedAttempt) {
        // Quiz already completed - redirect to results
        router.push(`/quizzes/${quizId}/results?attemptId=${quizDetails.latestCompletedAttempt.id}`)
      } else {
        // No attempts - start new attempt
        handleStartAttempt()
      }
    }
  }, [quizDetails, quizId, router])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          // Auto-submit when time runs out
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleStartAttempt = async () => {
    try {
      const result = await startAttempt()
      if (result) {
        setAttemptId(result.attemptId)
        if (result.timeLimit) {
          setTimeRemaining(result.timeLimit * 60)
        }
      }
    } catch (err) {
      console.error("Failed to start attempt:", err)
    }
  }

  const handleAnswerSelect = useCallback(
    async (questionId: string, selectedOptionId: string | null) => {
      if (!attemptId) return

      try {
        await saveAnswer(questionId, selectedOptionId, null)
        // Don't refetch - local state already handles UI update
        // Refetching causes the QuizPage component to remount and reset to question 1
      } catch (err) {
        console.error("Failed to save answer:", err)
      }
    },
    [attemptId, saveAnswer]
  )

  const handleSubmit = () => {
    setShowSubmitDialog(true)
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitDialog(false)
    setIsSubmitting(true)

    try {
      const result = await submitQuiz()
      if (result) {
        // Redirect to results page
        router.push(`/quizzes/${quizId}/results?attemptId=${attemptId}`)
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err)
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitQuiz()
      if (result) {
        router.push(`/quizzes/${quizId}/results?attemptId=${attemptId}`)
      }
    } catch (err) {
      console.error("Failed to auto-submit quiz:", err)
      setIsSubmitting(false)
    }
  }

  const handleEndQuiz = () => {
    setShowEndDialog(true)
  }

  const handleConfirmEnd = async () => {
    setShowEndDialog(false)
    await handleConfirmSubmit()
  }

  // Loading state
  if (detailsLoading || startingAttempt || (attemptId && questionsLoading)) {
    return (
      <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (detailsError || !quizDetails) {
    return (
      <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
        <div className="text-center py-8 text-gray-500">
          Failed to load quiz. Please try again.
        </div>
      </div>
    )
  }

  // Submitting state
  if (isSubmitting) {
    return (
      <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Submitting your quiz...</p>
        </div>
      </div>
    )
  }

  const totalQuestions = attemptData?.questions.length || quizDetails.totalQuestions

  return (
    <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
      <QuizDetailHeader
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onEndQuiz={handleEndQuiz}
        quizTitle={quizDetails.title}
        timeRemaining={timeRemaining}
      />

      {attemptData && (
        <QuizPage
          questions={attemptData.questions}
          onQuestionChange={setCurrentQuestion}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmit}
          isSaving={savingAnswer}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Quiz Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end the quiz? Your current answers will be submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnd}>End & Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
