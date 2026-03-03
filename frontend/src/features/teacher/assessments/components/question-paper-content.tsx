"use client"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Edit, Share2, Download, Printer, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFetch } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { downloadAssessmentPDF } from "@/lib/pdf-generator"

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
  const { data: assessment, isLoading } = useFetch<Assessment>(
    assessmentId ? `/assessments/${assessmentId}` : null
  )

  const handleModifyPrompt = () => {
    router.push(`/assessments/create/modify?id=${assessmentId}`)
  }

  const handleEditToggle = () => {
    if (onEditClick) {
      onEditClick(!isEditMode)
    }
  }

  // Print handler
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Download handler - generates and downloads PDF
  const handleDownload = useCallback(() => {
    if (assessment) {
      downloadAssessmentPDF(assessment, user?.name || "")
    }
  }, [assessment, user?.name])

  // Share handler
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href
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
  }, [assessment?.title])

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
        {!isEditMode ? (
          <div className="hidden lg:flex bg-[#E9E9E9] p-6 rounded-t-2xl items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">SAVRA - Question Paper</h1>
            </div>
            <button 
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#E2DFF0] rounded-lg hover:opacity-80"
            >
              Edit <Edit size={16} />
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex bg-[#E9E9E9] px-12 py-6 rounded-t-2xl items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">SAVRA - Question Paper</h1>
            </div>
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#E2DFF0] rounded-lg hover:opacity-80"
            >
              Edit <Edit size={16} />
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 border border-gray-200 rounded-b-2xl min-h-0">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="font-bold text-lg">Subject: {subject}</p>
            <p>Class: {grade}</p>
            <p>Chapter: {chapter}</p>
            <p>Time: {Math.floor(duration / 60)} Hour{duration >= 120 ? 's' : ''}{duration % 60 > 0 ? ` ${duration % 60} mins` : ''}</p>
          </div>
          <div>
            <p className="font-bold text-lg">Maximum Marks: {totalMarks}</p>
          </div>
        </div>

        {/* General Instructions Section */}
        <div className="mb-6">
          <p className="font-bold mb-2">General Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        {/* Questions - Render by sections if available */}
        <div className="mb-4">
          {questionPaper?.sections && questionPaper.sections.length > 0 ? (
            // Render sections from API
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
                      <p className="font-semibold">
                        Question {question.number || idx + 1}: {question.text}
                        {question.marks && <span className="text-gray-500 font-normal ml-2">({question.marks} marks)</span>}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, index) => (
                            <p key={index}>
                              {String.fromCharCode(97 + index)}) {option}
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
            // Render flat questions without section header
            <div className="space-y-6">
              {questions.map((question, idx) => (
                <div key={question.number || idx} className="space-y-2">
                  <p className="font-semibold">
                    Question {question.number || idx + 1}: {question.text}
                    {question.marks && <span className="text-gray-500 font-normal ml-2">({question.marks} marks)</span>}
                  </p>
                  {question.options && question.options.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {question.options.map((option, index) => (
                        <p key={index}>
                          {String.fromCharCode(97 + index)}) {option}
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
            {/* First Row: Print, Share */}
            <div className="flex justify-start items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm"
              >
                {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                {linkCopied ? "Copied!" : "Share"}
              </button>
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
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-1 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white rounded-xl font-semibold"
              >
                <Download size={18} /> Download
              </button>
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
              <button
                onClick={handleDownload}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]"
              >
                <Download size={18} /> Download
              </button>
              <button
                onClick={handlePrint}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]"
              >
                <Printer size={18} /> Print
              </button>
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
