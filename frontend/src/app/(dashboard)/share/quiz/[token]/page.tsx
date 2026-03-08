"use client"

import { useParams } from "next/navigation"
import { useFetch } from "@/hooks/use-api"
import { downloadQuizPDF } from "@/lib/pdf-generator"
import { downloadQuizDoc } from "@/lib/doc-generator"
import { Quiz } from "@/types/api"
import { DownloadDropdown } from "@/components/download-dropdown"

interface Option {
  id: string
  optionLabel: string
  optionText: string
}

interface Question {
  id: string
  questionText: string
  questionType: string
  marks: number
  orderIndex: number
  options?: Option[]
}

interface SharedQuiz {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
  chapters?: Array<{ id: string; name: string }>
  timeLimit?: number | null
  totalQuestions?: number
  totalMarks?: number
  difficultyLevel?: string
  questions?: Question[]
}

export default function SharedQuizPage() {
  const params = useParams()
  const token = params?.token as string | undefined

  const { data: quiz, isLoading, error } = useFetch<SharedQuiz>(
    token ? `/public/quizzes/${encodeURIComponent(token)}` : null
  )

  const subject = quiz?.subject?.name || "—"
  const grade = quiz?.class ? `${quiz.class.grade}${quiz.class.section}` : "—"
  const topics = quiz?.chapters?.map((c) => c.name).join(", ") || "—"
  const duration = quiz?.timeLimit ? `${quiz.timeLimit} mins` : "—"
  const totalQuestions = quiz?.totalQuestions ?? quiz?.questions?.length ?? 0
  const maxMarks = quiz?.totalMarks ?? totalQuestions
  const questions = quiz?.questions ?? []

  const handleDownloadPDF = () => {
    if (quiz) downloadQuizPDF(quiz as unknown as Quiz, "")
  }
  const handleDownloadWord = () => {
    if (quiz) downloadQuizDoc(quiz as unknown as Quiz, "")
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600">Invalid share link</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600 text-center">
          {error || "Quiz not found or no longer available."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-[#242220]">{quiz.title || "Quiz"}</h1>
          <DownloadDropdown
            onDownloadPDF={handleDownloadPDF}
            onDownloadWord={handleDownloadWord}
            label="Download"
            className="shrink-0"
          />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="font-bold text-lg">Subject: {subject}</p>
            <p>Class: {grade}</p>
            <p>Topic: {topics}</p>
            <p>Total Questions: {totalQuestions}</p>
            <p>Time: {duration}</p>
          </div>
          <div>
            <p className="font-bold text-lg">Maximum Marks: {maxMarks}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-bold mb-2">Instructions</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Attempt all questions.</li>
            <li>Each question carries 1 mark.</li>
            <li>Choose the most appropriate answer.</li>
            <li>No negative marking.</li>
          </ul>
        </div>

        <div className="mb-8 space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="space-y-2">
              <p className="font-semibold">
                Question {idx + 1}: {q.questionText}
              </p>
              {q.options && q.options.length > 0 && (
                <div className="ml-4 space-y-2">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">{opt.optionLabel}.</span>
                      <span>{opt.optionText}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
