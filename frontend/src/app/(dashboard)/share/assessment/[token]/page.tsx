"use client"

import { useParams } from "next/navigation"
import { useFetch } from "@/hooks/use-api"
import { downloadAssessmentPDF } from "@/lib/pdf-generator"
import { downloadAssessmentDoc } from "@/lib/doc-generator"
import { normalizeScientificText } from "@/lib/scientific-text"
import { DownloadDropdown } from "@/components/download-dropdown"

interface Question {
  number: number
  text: string
  options?: string[]
  marks?: number
}

interface Section {
  name?: string
  title?: string
  instructions?: string
  questions: Question[]
}

interface QuestionPaper {
  instructions?: string[]
  sections?: Section[]
  questions?: Question[]
}

interface SharedAssessment {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
  chapters?: Array<{ id: string; name: string }>
  totalMarks?: number
  questionPaper?: QuestionPaper | null
}

export default function SharedQuestionPaperPage() {
  const params = useParams()
  const token = params?.token as string | undefined

  const { data: assessment, isLoading, error } = useFetch<SharedAssessment>(
    token ? `/public/assessments/${encodeURIComponent(token)}` : null
  )

  const questionPaper = assessment?.questionPaper
  const sections = questionPaper?.sections
  const flatQuestions = questionPaper?.questions || (sections ? sections.flatMap((s) => s.questions || []) : [])
  const questions = flatQuestions.length > 0 ? flatQuestions : []
  const instructions = questionPaper?.instructions || [
    "All questions are compulsory.",
    "The question paper is designed to test understanding and application of concepts.",
    "Show necessary steps for full marks.",
    "Use of calculator is not permitted.",
  ]
  const subject = assessment?.subject?.name || "—"
  const grade = assessment?.class ? `${assessment.class.grade}-${assessment.class.section}` : "—"
  const chapter = assessment?.chapters?.map((c) => c.name).join(", ") || "—"
  const totalMarks = assessment?.totalMarks ?? 0

  const handleDownloadPDF = () => {
    if (assessment) downloadAssessmentPDF(assessment, "")
  }
  const handleDownloadWord = () => {
    if (assessment) downloadAssessmentDoc(assessment, "")
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

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600 text-center">
          {error || "Question paper not found or no longer available."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-[#242220]">SAVRA - Question Paper</h1>
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
            <p>Chapter: {chapter}</p>
            <p>Time: 60 mins</p>
          </div>
          <div>
            <p className="font-bold text-lg">Maximum Marks: {totalMarks}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-bold mb-2">General Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            {instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </div>

        <div className="mb-8">
          {sections && sections.length > 0 ? (
            sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="mb-6">
                <p className="font-bold text-lg mb-4">
                  {section.title || section.name || `Section ${String.fromCharCode(65 + sectionIdx)}`}
                </p>
                {section.instructions && (
                  <p className="text-sm text-gray-600 mb-3 italic">{section.instructions}</p>
                )}
                <div className="space-y-6">
                  {(section.questions || []).map((q, idx) => (
                    <div key={q.number ?? idx} className="space-y-2">
                      <p className="font-semibold break-words">
                        Question {q.number ?? idx + 1}: {normalizeScientificText(q.text)}
                        {q.marks != null && (
                          <span className="text-gray-500 font-normal ml-2">({q.marks} marks)</span>
                        )}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {q.options.map((opt, i) => (
                            <p key={i}>
                              {String.fromCharCode(97 + i)}) {normalizeScientificText(opt)}
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
              {questions.map((q, idx) => (
                <div key={q.number ?? idx} className="space-y-2">
                  <p className="font-semibold break-words">
                    Question {q.number ?? idx + 1}: {normalizeScientificText(q.text)}
                    {q.marks != null && (
                      <span className="text-gray-500 font-normal ml-2">({q.marks} marks)</span>
                    )}
                  </p>
                  {q.options && q.options.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {q.options.map((opt, i) => (
                        <p key={i}>
                          {String.fromCharCode(97 + i)}) {normalizeScientificText(opt)}
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
    </div>
  )
}
