"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Share2, Download, Printer, FileText, Edit, Check } from "lucide-react"
import { getAppBaseUrl } from "@/lib/app-url"
import PublishDialog from "./publish-dialog"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { downloadQuizPDF, downloadQuizAnswerKeyPDF } from "@/lib/pdf-generator"
import { downloadQuizDoc, downloadQuizAnswerKeyDoc } from "@/lib/doc-generator"
import { DownloadDropdown } from "@/components/download-dropdown"
import { Quiz as QuizType } from "@/types/api"
import { EditableQuiz } from "./editable-quiz"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  type: "multiple_choice" | "true_false"
}

interface Quiz {
  id: string
  title: string
  numQuestions: number
  level: string
  duration: number
  objective?: string
  status: string
  totalMarks?: number
  questions?: Question[]
  chapters?: string[]
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
}

interface GeneratedQuizProps {
  quiz?: Quiz | null
  onSave?: () => void
}

export default function GeneratedQuiz({ quiz, onSave }: GeneratedQuizProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizId = searchParams.get("id")
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({})

  // Use API questions or fallback to empty array
  const questions = quiz?.questions || []

  const handleCheckboxChange = (questionIndex: number, option: string) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionIndex] || []
      if (current.includes(option)) {
        return { ...prev, [questionIndex]: current.filter((o) => o !== option) }
      } else {
        return { ...prev, [questionIndex]: [...current, option] }
      }
    })
  }

  const handleModifyPrompt = () => {
    router.push(`/quiz/generated/modify?id=${quizId}`)
  }

  const handleEditToggle = () => setIsEditMode((prev) => !prev)

  const handleSaveQuiz = useCallback(
    async (editableQuestions: { id: string; text: string; options: string[]; correctAnswerIndex: number }[]) => {
      if (!quizId) return
      setIsSaving(true)
      setSaveError(null)
      try {
        for (const q of editableQuestions) {
          const options = (q.options || []).map((text, i) => ({
            label: String.fromCharCode(65 + i),
            text: text.trim(),
            isCorrect: i === q.correctAnswerIndex,
          }))
          if (options.length < 2) continue
          const correctCount = options.filter((o) => o.isCorrect).length
          if (correctCount !== 1) continue
          await api.put(`/quizzes/${quizId}/questions/${q.id}`, {
            questionText: q.text.trim(),
            questionType: "mcq",
            marks: 1,
            options,
          })
        }
        await onSave?.()
        setIsEditMode(false)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save quiz")
      } finally {
        setIsSaving(false)
      }
    },
    [quizId, onSave]
  )

  const handleSaveDraft = async () => {
    if (!quizId) return

    setIsSaving(true)
    setSaveError(null)

    try {
      await api.patch(`/quizzes/${quizId}/status`, { status: "draft" })
      onSave?.()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle print
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Build quiz structure for PDF/Word (shared conversion)
  const buildQuizForExport = useCallback((): QuizType | null => {
    if (!quiz) return null
    return {
      id: quiz.id,
      teacherId: "",
      classId: "",
      subjectId: "",
      title: quiz.title,
      objective: quiz.objective,
      timeLimit: quiz.duration,
      difficultyLevel: (quiz.level?.toLowerCase() as 'easy' | 'medium' | 'hard') || 'medium',
      totalQuestions: quiz.numQuestions || quiz.questions?.length || 0,
      totalMarks: quiz.totalMarks || quiz.numQuestions || quiz.questions?.length || 0,
      status: quiz.status as 'generated' | 'draft' | 'saved' | 'published',
      isOptional: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      class: quiz.class ? {
        id: quiz.class.id,
        name: quiz.class.name,
        grade: quiz.class.grade,
        section: quiz.class.section,
        schoolId: "",
        createdAt: new Date().toISOString()
      } : undefined,
      subject: quiz.subject ? {
        id: quiz.subject.id,
        name: quiz.subject.name,
        code: (quiz.subject as any).code || ""
      } : undefined,
      chapters: quiz.chapters?.map((name, index) => ({
        id: `chapter-${index}`,
        name: typeof name === 'string' ? name : (name as any).name || '',
        subjectId: "",
        orderIndex: index
      })),
      questions: quiz.questions?.map((q, index) => ({
        id: q.id,
        quizId: quiz.id,
        questionText: q.text || (q as any).questionText || "",
        questionType: 'mcq' as const,
        marks: 1,
        orderIndex: index + 1,
        createdAt: new Date().toISOString(),
        options: q.options?.map((opt, optIndex) => ({
          id: `opt-${index}-${optIndex}`,
          questionId: q.id,
          optionLabel: String.fromCharCode(65 + optIndex), // A, B, C, D
          optionText: typeof opt === 'string' ? opt : (opt as any).optionText || (opt as any).text || "",
          isCorrect: typeof opt === 'string' ? opt === q.correctAnswer : (opt as any).isCorrect || false
        }))
      }))
    } as QuizType
  }, [quiz])

  const handleDownloadPDF = useCallback(() => {
    const quizForPdf = buildQuizForExport()
    if (!quizForPdf) return
    downloadQuizPDF(quizForPdf, user?.name || "Teacher")
  }, [buildQuizForExport, user])

  const handleDownloadWord = useCallback(() => {
    const q = buildQuizForExport()
    if (!q) return
    const forDoc = {
      id: q.id,
      title: q.title,
      subject: q.subject,
      class: q.class,
      chapters: q.chapters,
      timeLimit: q.timeLimit,
      totalQuestions: q.totalQuestions,
      totalMarks: q.totalMarks,
      questions: q.questions?.map((qn) => ({
        questionText: qn.questionText,
        questionType: qn.questionType,
        marks: qn.marks,
        options: qn.options?.map((o) => ({ optionLabel: o.optionLabel, optionText: o.optionText })),
      })),
    }
    downloadQuizDoc(forDoc, user?.name || "Teacher")
  }, [buildQuizForExport, user])

  const handleAnswerKeyPDF = useCallback(() => {
    const quizForPdf = buildQuizForExport()
    if (!quizForPdf) return
    downloadQuizAnswerKeyPDF(quizForPdf, user?.name || "Teacher")
  }, [buildQuizForExport, user])

  const handleAnswerKeyWord = useCallback(() => {
    const q = buildQuizForExport()
    if (!q) return
    const forDoc = {
      id: q.id,
      title: q.title,
      subject: q.subject,
      class: q.class,
      chapters: q.chapters,
      timeLimit: q.timeLimit,
      totalQuestions: q.totalQuestions,
      totalMarks: q.totalMarks,
      questions: q.questions?.map((qn) => ({
        questionText: qn.questionText,
        questionType: qn.questionType,
        marks: qn.marks,
        options: qn.options?.map((o) => ({
          optionLabel: o.optionLabel,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        })),
      })),
    }
    downloadQuizAnswerKeyDoc(forDoc, user?.name || "Teacher")
  }, [buildQuizForExport, user])

  // Handle share - fetches public share link and shares it
  const handleShare = useCallback(async () => {
    if (!quizId) return
    try {
      const res = await api.post<{ success: boolean; data: { shareToken: string } }>(
        `/quizzes/${quizId}/share`,
        {}
      )
      const shareToken = res?.data?.shareToken
      if (!shareToken) {
        alert("Unable to create share link. Generate questions first.")
        return
      }
      const shareUrl = `${getAppBaseUrl()}/share/quiz/${shareToken}`
      const shareData = {
        title: quiz?.title || "Quiz",
        text: `Check out this quiz: ${quiz?.title || "Quiz"}`,
        url: shareUrl,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
          return
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Share failed:", err)
          }
        }
      }

      try {
        await navigator.clipboard.writeText(shareUrl)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy link:", err)
        alert(`Copy this link: ${shareUrl}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create share link"
      alert(msg)
    }
  }, [quizId, quiz?.title])

  // Dynamic quiz info
  const quizTitle = quiz?.title || "Generated Quiz"
  const quizDuration = quiz?.duration ? `${quiz.duration} mins` : "15 mins"
  const subjectName = quiz?.subject?.name || "Mathematics"
  const className = quiz?.class ? `${quiz.class.grade}${quiz.class.section}` : "VII"
  const topics = quiz?.chapters?.join(", ") || "Fractions"
  const totalQuestions = quiz?.numQuestions || questions.length || 10
  const maxMarks = totalQuestions // 1 mark per MCQ question

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile: Plan Name, Duration, Edit */}
        <div className="flex-shrink-0 lg:hidden bg-[#E9E9E9] px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#242220]">{quizTitle}</h2>
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-[#242220]">{quizDuration}</span>
            <button
              onClick={handleEditToggle}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                isEditMode ? "bg-[#DF6647] text-white" : "bg-[#E2DFF0] text-gray-700 hover:bg-[#D5D2E3]"
              }`}
            >
              {isEditMode ? "Done" : "Edit"} <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Desktop Header with Title and Edit */}
        <div className="flex-shrink-0 hidden lg:flex bg-[#E9E9E9] px-12 py-6 rounded-t-2xl items-center justify-between">
          <h1 className="text-xl font-bold">{quizTitle}</h1>
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
              isEditMode ? "bg-[#DF6647] text-white" : "bg-[#E2DFF0] text-gray-700 hover:bg-[#D5D2E3]"
            }`}
          >
            {isEditMode ? "Done" : "Edit"} <Edit size={16} />
          </button>
        </div>

        {/* Error Message - shown in both modes */}
        {saveError && (
          <div className="px-4 lg:px-12 py-2 shrink-0">
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {saveError}
            </div>
          </div>
        )}

        {/* Content: Edit mode vs Read-only */}
        {isEditMode ? (
          <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-b-2xl overflow-hidden">
            <EditableQuiz
              questions={questions.map((q, i) => ({
                id: q.id,
                text: q.text,
                options: q.options || [],
                correctAnswerIndex: Math.max(
                  0,
                  (q.options || []).indexOf(q.correctAnswer)
                ),
              }))}
              onSave={handleSaveQuiz}
              onCancel={() => setIsEditMode(false)}
              isSaving={isSaving}
            />
          </div>
        ) : (
        <>
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 lg:px-8 py-4 lg:py-6">
            {/* Quiz Parameters Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="font-bold text-base lg:text-lg">Subject: {subjectName}</p>
                <p className="text-sm lg:text-base">Class: {className}</p>
                <p className="text-sm lg:text-base">Topic: {topics}</p>
                <p className="text-sm lg:text-base">Total Questions: {totalQuestions}</p>
                <p className="text-sm lg:text-base">Time: {quizDuration}</p>
              </div>
              <div>
                <p className="font-bold text-base lg:text-lg">Maximum Marks: {maxMarks}</p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mb-6">
              <p className="font-bold mb-2 text-sm lg:text-base">Instructions</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm lg:text-base">
                <li>Attempt all questions.</li>
                <li>Each question carries 1 mark.</li>
                <li>Choose the most appropriate answer.</li>
                <li>No negative marking.</li>
              </ul>
            </div>

            {/* Questions Section */}
            <div className="mb-4">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions generated yet.</p>
                  <p className="text-sm mt-2">Questions will appear here once generated.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id || index} className="space-y-3">
                      <p className="font-semibold text-sm lg:text-base">
                        Question {index + 1}
                      </p>
                      <p className="text-sm lg:text-base">{question.text}</p>
                      <div className="ml-4 space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isChecked = selectedAnswers[index]?.includes(option) || false
                          return (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(index, option)}
                                className="w-4 h-4 border-gray-300 rounded text-[#7D5CB0] focus:ring-[#7D5CB0] cursor-pointer"
                              />
                              <span className="text-sm lg:text-base">{option}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-4 lg:px-12 py-4 lg:py-6 border-t border-gray-200">
          {/* Mobile: Stack buttons */}
          <div className="lg:hidden flex flex-col gap-4">
            {/* First Row: Print, Save draft, Share, Answer Key */}
            <div className="flex justify-start items-center gap-3 flex-wrap">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                <FileText size={18} /> {isSaving ? "Saving..." : "Save draft"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm"
              >
                {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                {linkCopied ? "Copied!" : "Share"}
              </button>
              <DownloadDropdown
                onDownloadPDF={handleAnswerKeyPDF}
                onDownloadWord={handleAnswerKeyWord}
                label="Answer Key"
                className="bg-[#B595FF] hover:bg-[#A085EF] text-white border-0 rounded-xl font-semibold text-sm"
              />
            </div>
            {/* Second Row: Modify Prompt and Download */}
            <div className="flex gap-3">
              <Button
                onClick={handleModifyPrompt}
                variant="outline"
                className="flex-1 border-2 border-[#DF6647] text-[#DF6647] bg-white rounded-xl font-semibold hover:bg-[#DF6647]/10 transition-colors"
              >
                Modify Prompt
              </Button>
              <DownloadDropdown
                onDownloadPDF={handleDownloadPDF}
                onDownloadWord={handleDownloadWord}
                label="Download"
                className="flex-1 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white border-0"
              />
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]"
              >
                {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                {linkCopied ? "Copied!" : "Share"}
              </button>
              <DownloadDropdown
                onDownloadPDF={handleDownloadPDF}
                onDownloadWord={handleDownloadWord}
                label="Download"
                variant="outline"
                className="bg-[#E2DFF0] border-0 text-gray-700 hover:bg-[#D5D2E3]"
              />
              <button
                onClick={handlePrint}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium disabled:opacity-50 hover:bg-[#D5D2E3]"
              >
                <FileText size={18} /> {isSaving ? "Saving..." : "Draft"}
              </button>
              <DownloadDropdown
                onDownloadPDF={handleAnswerKeyPDF}
                onDownloadWord={handleAnswerKeyWord}
                label="Answer Key"
                className="bg-[#E2DFF0] border-0 text-gray-700 hover:bg-[#D5D2E3]"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleModifyPrompt}
                className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium"
              >
                Modify Prompt
              </button>
              <PublishDialog quizId={quizId} onPublish={onSave}>
                <button className="px-6 py-1 text-sm bg-[#DF6647] text-white rounded-lg font-medium">
                  Publish
                </button>
              </PublishDialog>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
