"use client"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Edit, Share2, Download, Printer, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFetch } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { downloadAssessmentPDF, downloadAssessmentAnswerKeyPDF } from "@/lib/pdf-generator"
import { downloadAssessmentDoc, downloadAssessmentAnswerKeyDoc } from "@/lib/doc-generator"
import { normalizeScientificText } from "@/lib/scientific-text"
import { DownloadDropdown } from "@/components/download-dropdown"
import { getAppBaseUrl } from "@/lib/app-url"
import { EditableQuestionPaper } from "./editable-question-paper"
import { api } from "@/lib/api"

interface Question {
  number: number
  text: string
  options?: string[]
  type?: string
  marks?: number
  answer?: string
}

interface Section {
  name?: string
  title?: string
  type?: string
  instructions?: string
  questions: Question[]
}

interface QuestionPaper {
  title?: string
  instructions?: string[]
  sections?: Section[]
  questions?: Question[]
}

interface Assessment {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
  chapters?: Array<{ id: string; name: string }>
  totalMarks?: number
  difficultyLevel?: string
  questionPaper?: QuestionPaper | null
  status?: string
}

interface QuestionPaperContentProps {
  onEditClick?: (isEdit: boolean) => void
  isEditMode?: boolean
}

function QuestionPaperContentInner({ onEditClick, isEditMode = false }: QuestionPaperContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")
  const { user } = useAuth()

  // State for share action
  const [linkCopied, setLinkCopied] = useState(false)

  // Fetch assessment data from API
  const { data: assessment, isLoading, refetch } = useFetch<Assessment>(
    assessmentId ? `/assessments/${assessmentId}` : null
  )

  const [isSaving, setIsSaving] = useState(false)

  const handleModifyPrompt = () => {
    router.push(`/assessments/create/modify?id=${assessmentId}`)
  }

  const handleSaveDraft = async () => {
    if (!assessmentId) return
    setIsSaving(true)
    try {
      await api.patch(`/assessments/${assessmentId}/status`, { status: "draft" })
      await refetch()
    } catch (err) {
      console.error("Failed to save draft:", err)
      alert(err instanceof Error ? err.message : "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditToggle = () => {
    if (onEditClick) {
      onEditClick(!isEditMode)
    }
  }

  const handleSaveQuestionPaper = useCallback(
    async (paper: { instructions?: string[]; sections?: unknown[]; questions?: unknown[] }) => {
      if (!assessmentId) return
      setIsSaving(true)
      try {
        await api.put(`/assessments/${assessmentId}`, { questionPaper: paper })
        await refetch()
        onEditClick?.(false)
      } catch (err) {
        console.error("Failed to save question paper:", err)
        alert(err instanceof Error ? err.message : "Failed to save")
      } finally {
        setIsSaving(false)
      }
    },
    [assessmentId, refetch, onEditClick]
  )

  // Print handler
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(() => {
    if (assessment) downloadAssessmentPDF(assessment, user?.name || "")
  }, [assessment, user?.name])

  const handleDownloadWord = useCallback(() => {
    if (assessment) downloadAssessmentDoc(assessment, user?.name || "")
  }, [assessment, user?.name])

  const handleAnswerKeyPDF = useCallback(() => {
    if (assessment) downloadAssessmentAnswerKeyPDF(assessment, user?.name || "")
  }, [assessment, user?.name])

  const handleAnswerKeyWord = useCallback(() => {
    if (assessment) downloadAssessmentAnswerKeyDoc(assessment, user?.name || "")
  }, [assessment, user?.name])

  // Share handler - fetches public share link and shares it
  const handleShare = useCallback(async () => {
    if (!assessmentId) return
    try {
      const res = await api.post<{ success: boolean; data: { shareToken: string } }>(
        `/assessments/${assessmentId}/share`,
        {}
      )
      const shareToken = res?.data?.shareToken
      if (!shareToken) {
        alert("Unable to create share link. Generate a question paper first.")
        return
      }
      const shareUrl = `${getAppBaseUrl()}/share/assessment/${shareToken}`
      const shareData = {
        title: assessment?.title || "Question Paper",
        text: `Check out this question paper: ${assessment?.title || "Question Paper"}`,
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
  }, [assessmentId, assessment?.title])

  // Fallback questions for preview/demo mode
  const FALLBACK_QUESTIONS: Question[] = [
    { number: 1, text: "Which of the following represents the largest fraction?", options: ["3/7", "5/7", "4/9", "2/3"] },
    { number: 2, text: "A fraction equivalent to 6/8 is:", options: ["3/4", "2/3", "4/5", "5/6"] },
    { number: 3, text: "What is the sum of 1/4 + 1/2?", options: ["2/6", "3/4", "1/3", "3/6"] },
    { number: 4, text: "Which fraction is the smallest?", options: ["1/2", "1/3", "1/4", "1/5"] },
    { number: 5, text: "Convert 0.5 to a fraction:", options: ["1/4", "1/2", "1/3", "2/3"] },
    { number: 6, text: "What is 3/4 of 16?", options: ["10", "12", "14", "15"] },
    { number: 7, text: "Which of the following is a proper fraction?", options: ["5/4", "4/3", "3/4", "6/5"] },
    { number: 8, text: "Find the value of 2/3 - 1/6:", options: ["1/3", "1/2", "2/3", "3/4"] },
    { number: 9, text: "What is the reciprocal of 3/5?", options: ["5/3", "3/5", "5/2", "2/5"] },
    { number: 10, text: "Which fraction is greater than 1/2?", options: ["2/5", "3/7", "4/9", "5/8"] },
  ]

  // Extract questions from questionPaper - handle both flat and sectioned formats
  const questionPaper = assessment?.questionPaper
  const questions = questionPaper?.questions ||
    questionPaper?.sections?.flatMap(s => s.questions) ||
    FALLBACK_QUESTIONS

  const subject = assessment?.subject?.name || "Mathematics"
  const grade = assessment?.class ? `${assessment.class.grade}-${assessment.class.section}` : "VII"
  const chapter = assessment?.chapters?.map(c => c.name).join(", ") || "Fractions"
  const totalMarks = assessment?.totalMarks || 100
  const duration = 60 // Default duration since it's not in assessment schema
  const instructions = questionPaper?.instructions || [
    "All questions are compulsory.",
    "The question paper is designed to test understanding and application of concepts.",
    "Show necessary steps for full marks.",
    "Use of calculator is not permitted.",
  ]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile: Title below header */}
      <div className="lg:hidden mb-4">
        <h2 className="text-base font-medium text-[#242220]">7's Generated Question Paper</h2>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden min-h-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-[#E9E9E9] p-6 rounded-t-2xl items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">SAVRA - Question Paper</h1>
          </div>
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-80 ${
              isEditMode ? "bg-[#DF6647] text-white" : "bg-[#E2DFF0]"
            }`}
          >
            {isEditMode ? "Done" : "Edit"} <Edit size={16} />
          </button>
        </div>

        {/* Content: Edit mode vs Read-only */}
        {isEditMode ? (
          <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-b-2xl overflow-hidden">
            <EditableQuestionPaper
              questionPaper={
                questionPaper || {
                  instructions,
                  sections: [{ title: "Questions", questions }],
                }
              }
              onSave={handleSaveQuestionPaper}
              onCancel={() => onEditClick?.(false)}
              isSaving={isSaving}
            />
          </div>
        ) : (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 border border-gray-200 rounded-b-2xl min-h-0">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="font-bold text-lg">Subject: {subject}</p>
                  <p>Class: {grade}</p>
                  <p>Chapter: {chapter}</p>
                  <p>Time: {Math.floor(duration / 60)} Hour{duration >= 120 ? "s" : ""}{duration % 60 > 0 ? ` ${duration % 60} mins` : ""}</p>
                </div>
                <div>
                  <p className="font-bold text-lg">Maximum Marks: {totalMarks}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="font-bold mb-2">General Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  {instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="mb-4">
                {questionPaper?.sections && questionPaper.sections.length > 0 ? (
                  questionPaper.sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="mb-6">
                      <p className="font-bold text-lg mb-4">
                        {section.title || section.name || `Section ${String.fromCharCode(65 + sectionIdx)}`}
                      </p>
                      {section.instructions && (
                        <p className="text-sm text-gray-600 mb-3 italic">{section.instructions}</p>
                      )}
                      <div className="space-y-6">
                        {section.questions.map((question, idx) => (
                          <div key={question.number || idx} className="space-y-2">
                            <p className="font-semibold break-words">
                              Question {question.number || idx + 1}: {normalizeScientificText(question.text)}
                              {question.marks && <span className="text-gray-500 font-normal ml-2">({question.marks} marks)</span>}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {question.options.map((option, index) => (
                                  <p key={index}>
                                    {String.fromCharCode(97 + index)}) {normalizeScientificText(option)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-6">
                    {questions.map((question, idx) => (
                      <div key={question.number || idx} className="space-y-2">
                        <p className="font-semibold break-words">
                          Question {question.number || idx + 1}: {normalizeScientificText(question.text)}
                          {question.marks && <span className="text-gray-500 font-normal ml-2">({question.marks} marks)</span>}
                        </p>
                        {question.options && question.options.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {question.options.map((option, index) => (
                              <p key={index}>
                                {String.fromCharCode(97 + index)}) {normalizeScientificText(option)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-gray-200">
          {/* Mobile: Stack buttons */}
          <div className="lg:hidden flex flex-col gap-4 px-4 py-4">
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
          <div className="hidden lg:flex py-6 items-center gap-2 flex-wrap justify-between px-8">
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
                <FileText size={18} /> {isSaving ? "Saving..." : "Save draft"}
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
                className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium hover:bg-[#DF6647] hover:text-white transition-colors"
              >
                Modify Prompt
              </button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function QuestionPaperContent(props: QuestionPaperContentProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <QuestionPaperContentInner {...props} />
    </Suspense>
  )
}
