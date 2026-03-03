"use client"

import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CheckCircle, XCircle, Clock, Trophy, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuizResults, QuizResultQuestion } from "@/hooks/use-quiz"

// Format seconds to readable string
function formatTimeTaken(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs} seconds`
  }
  return `${mins} min ${secs} sec`
}

// Result question card component
function ResultQuestionCard({
  question,
  index,
}: {
  question: QuizResultQuestion
  index: number
}) {
  const studentAnswer = question.studentAnswer
  const isCorrect = studentAnswer?.isCorrect
  const isMCQ = question.questionType === "mcq"

  return (
    <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
      {/* Question header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Question {index + 1}</h3>
        <div className="flex items-center gap-2">
          {isCorrect === true && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Correct
            </span>
          )}
          {isCorrect === false && (
            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
              <XCircle className="w-4 h-4" />
              Incorrect
            </span>
          )}
          {isCorrect === null && (
            <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
              Pending Review
            </span>
          )}
          <span className="text-gray-500 text-sm">
            {studentAnswer?.marksObtained || 0}/{question.marks} marks
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-gray-700 mb-4">{question.questionText}</p>

      {/* Options for MCQ */}
      {isMCQ && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isStudentAnswer = studentAnswer?.selectedOptionId === option.id
            const isCorrectAnswer = option.isCorrect

            let optionStyle = "border-gray-200 bg-gray-50"
            if (isCorrectAnswer) {
              optionStyle = "border-green-500 bg-green-50"
            } else if (isStudentAnswer && !isCorrectAnswer) {
              optionStyle = "border-red-500 bg-red-50"
            }

            return (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 ${optionStyle}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    isCorrectAnswer
                      ? "bg-green-500 text-white"
                      : isStudentAnswer
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {option.optionLabel}
                </div>
                <span className="text-gray-700">{option.optionText}</span>
                {isStudentAnswer && (
                  <span className="ml-auto text-sm text-gray-500">(Your answer)</span>
                )}
                {isCorrectAnswer && !isStudentAnswer && (
                  <span className="ml-auto text-sm text-green-600">(Correct answer)</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Text answer for non-MCQ */}
      {!isMCQ && studentAnswer?.answerText && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your answer:</p>
          <p className="text-gray-800">{studentAnswer.answerText}</p>
        </div>
      )}
    </div>
  )
}

export default function QuizResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.id as string
  const attemptId = searchParams.get("attemptId")

  const { data: results, isLoading, error } = useQuizResults(quizId, attemptId)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !results) {
    return (
      <div className="flex flex-col max-w-full p-4 lg:p-8 h-full">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Failed to load results. Please try again.</p>
          <Link href="/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  const correctCount = results.questions.filter(
    (q) => q.studentAnswer?.isCorrect === true
  ).length
  const incorrectCount = results.questions.filter(
    (q) => q.studentAnswer?.isCorrect === false
  ).length
  const pendingCount = results.questions.filter(
    (q) => q.studentAnswer?.isCorrect === null
  ).length

  return (
    <div className="flex flex-col max-w-full p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-6">
        <Link href="/quizzes">
          <ChevronLeft className="w-10 h-10 text-black rounded-full p-2 bg-[#F5F5F5] cursor-pointer hover:opacity-70 transition-opacity" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#242220]">
            {results.quiz.title} - Results
          </h1>
          <p className="text-gray-500">Submitted on {new Date(results.submittedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Score Summary Card */}
      <div className="bg-gradient-to-r from-[#9B61FF] to-[#7C3AED] rounded-xl p-6 lg:p-8 text-white mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Score */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-8 h-8" />
            </div>
            <p className="text-3xl lg:text-4xl font-bold">{Number(results.percentage).toFixed(0)}%</p>
            <p className="text-white/80 text-sm">Score</p>
          </div>

          {/* Marks */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-3xl lg:text-4xl font-bold">
              {results.score}/{results.totalMarks}
            </p>
            <p className="text-white/80 text-sm">Marks</p>
          </div>

          {/* Time Taken */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{formatTimeTaken(results.timeTaken)}</p>
            <p className="text-white/80 text-sm">Time Taken</p>
          </div>

          {/* Questions */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-3xl lg:text-4xl font-bold">
              {correctCount}/{results.quiz.totalQuestions}
            </p>
            <p className="text-white/80 text-sm">Correct</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">{correctCount} Correct</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{incorrectCount} Incorrect</span>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <span className="font-medium">{pendingCount} Pending Review</span>
          </div>
        )}
      </div>

      {/* Questions Review */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Answer Review</h2>
        <div className="space-y-4">
          {results.questions.map((question, index) => (
            <ResultQuestionCard key={question.id} question={question} index={index} />
          ))}
        </div>
      </div>

      {/* Back to Quizzes button */}
      <div className="flex justify-center">
        <Link href="/quizzes">
          <Button className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white px-8 py-3">
            Back to Quizzes
          </Button>
        </Link>
      </div>
    </div>
  )
}
