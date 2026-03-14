"use client"

import { Suspense, useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Edit, Share2, Printer, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { queryKeys, useApiQuery } from "@/hooks/use-query"
import { useAuth } from "@/contexts/auth-context"
import { useGeneration } from "@/contexts/generation-context"
import { downloadAssessmentPDF, downloadAssessmentAnswerKeyPDF } from "@/lib/pdf-generator"
import { downloadAssessmentDoc, downloadAssessmentAnswerKeyDoc } from "@/lib/doc-generator"
import { normalizeScientificText } from "@/lib/scientific-text"
import { DownloadDropdown } from "@/components/download-dropdown"
import { getAppBaseUrl } from "@/lib/app-url"
import { EditableQuestionPaper } from "./editable-question-paper"
import { api } from "@/lib/api"
import {
  getGenerationStageLabel,
  normalizeGenerationProgress,
} from "@/lib/generation-jobs"

interface Question {
  number: number
  text: string
  options?: string[]
  type?: string
  marks?: number
  answer?: string
  orText?: string
  orAnswer?: string
}

interface Section {
  name?: string
  title?: string
  type?: string
  instructions?: string
  marksInfo?: string
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

function getQuestionKey(question: Question, idx: number, scope: string) {
  return `${scope}-${question.number ?? idx}-${question.text}`
}

function toRomanLower(n: number): string {
  const lookup: [number, string][] = [[10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]]
  let result = ""
  let remaining = n
  for (const [value, numeral] of lookup) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  return result
}

function QuestionPaperContentInner({ onEditClick, isEditMode = false }: QuestionPaperContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")
  const { user } = useAuth()
  const { activeJob } = useGeneration()

  // State for share action
  const [linkCopied, setLinkCopied] = useState(false)

  // Fetch assessment data from API
  const { data: assessment, isLoading, isFetching, refetch } = useApiQuery<Assessment>({
    queryKey: queryKeys.assessment(assessmentId ?? "missing"),
    endpoint: `/assessments/${assessmentId}`,
    enabled: !!assessmentId,
  })

  const [isSaving, setIsSaving] = useState(false)

  const isCurrentAssessmentJob =
    activeJob?.artifactType === "assessment" && activeJob.artifactId === assessmentId
  const isCurrentAssessmentGenerating =
    isCurrentAssessmentJob && (activeJob.status === "queued" || activeJob.status === "running")
  const isCurrentAssessmentCompleted =
    isCurrentAssessmentJob && activeJob.status === "completed"

  const handleModifyPrompt = () => {
    router.push(`/assessments/create/modify?id=${assessmentId}`)
  }

  const handleSaveDraft = async () => {
    if (!assessmentId) return
    // Already draft — no-op to avoid "Cannot change status from draft to draft" error
    if (assessment?.status === "draft") {
      return
    }
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

  const questionPaper = assessment?.questionPaper
  const hasQuestionPaperContent = Boolean(
    questionPaper &&
      (
        (questionPaper.questions?.length ?? 0) > 0 ||
        questionPaper.sections?.some((section) => section.questions.length > 0)
      )
  )
  const isAwaitingCompletedQuestionPaper =
    isCurrentAssessmentCompleted &&
    !hasQuestionPaperContent &&
    (isLoading || isFetching)
  const questions = questionPaper?.questions ||
    questionPaper?.sections?.flatMap(s => s.questions) ||
    []

  const subject = assessment?.subject?.name || "Mathematics"
  const grade = assessment?.class ? `${assessment.class.grade}-${assessment.class.section}` : "VII"
  const gradeNumber = assessment?.class?.grade
  const chapter = assessment?.chapters?.map(c => c.name).join(", ") || "Fractions"
  const totalMarks = assessment?.totalMarks || 100
  const duration = 60 // Default duration since it's not in assessment schema
  const isMathSubject = ["mathematics", "maths"].includes(subject.trim().toLowerCase())
  const isCbseMathPaper = isMathSubject && (gradeNumber === 11 || gradeNumber === 12)
  const isPhysicsSubject = subject.trim().toLowerCase() === "physics"
  const isCbsePhysicsPaper = isPhysicsSubject && (gradeNumber === 11 || gradeNumber === 12)
  const isStructuredCbsePaper = isCbseMathPaper || isCbsePhysicsPaper
  const timeAllowedLabel = isCbsePhysicsPaper
    ? (totalMarks >= 70 ? "3 Hours" : totalMarks >= 40 ? "2 Hours" : "1 Hour")
    : totalMarks >= 80 ? "3 Hours" : totalMarks >= 40 ? "2 Hours" : "1 Hour"
  const instructions = questionPaper?.instructions || [
    "All questions are compulsory.",
    "The question paper is designed to test understanding and application of concepts.",
    "Show necessary steps for full marks.",
    "Use of calculator is not permitted.",
  ]

  useEffect(() => {
    if (activeJob?.status === "completed" && isCurrentAssessmentJob) {
      void refetch()
    }
  }, [activeJob?.status, isCurrentAssessmentJob, refetch])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isAwaitingCompletedQuestionPaper) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Opening generated question paper...</p>
        </div>
      </div>
    )
  }

  if (!hasQuestionPaperContent && isCurrentAssessmentGenerating && activeJob) {
    const progress = normalizeGenerationProgress(activeJob)

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 rounded-2xl border border-[#E8E2F0] bg-white p-6 shadow-sm lg:p-10">
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E9FF]">
              <div className="h-7 w-7 rounded-full border-4 border-[#D9C6FF] border-t-[#9B61FF] animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-[#242220]">Your question paper is on the way</h3>
            <p className="mt-2 text-sm leading-6 text-[#6A6A6A]">
              You can stay here or keep browsing the app. Use the floating button to check progress anytime.
            </p>
            <div className="mt-6 w-full rounded-2xl bg-[#F8F5FC] p-5 text-left">
              <div className="mb-3 flex items-center justify-between text-sm font-medium text-[#353535]">
                <span>{getGenerationStageLabel(activeJob.stage)}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E8E2F0]">
                <div
                  className="h-full rounded-full bg-[#9B61FF] transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasQuestionPaperContent) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 rounded-2xl border border-[#E8E2F0] bg-white p-6 shadow-sm lg:p-10">
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold text-[#242220]">No question paper available yet</h3>
            <p className="mt-2 text-sm leading-6 text-[#6A6A6A]">
              Start a new generation or retry the existing one to populate this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile: Title below header */}
      <div className="lg:hidden mb-4">
        <h2 className="text-base font-medium text-[#242220]">7&apos;s Generated Question Paper</h2>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden min-h-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-[#E9E9E9] p-6 rounded-t-2xl items-center justify-between shrink-0">
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
              {isStructuredCbsePaper ? (
                <>
                  {/* ── Paper Header ── */}
                  <div className="border-b-2 border-gray-800 pb-3 mb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm"><span className="font-bold">Subject:</span> {subject}</p>
                        <p className="text-sm"><span className="font-bold">Class:</span> {grade}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-sm"><span className="font-bold">Maximum Marks:</span> {totalMarks}</p>
                        <p className="text-sm"><span className="font-bold">Time Allowed:</span> {timeAllowedLabel}</p>
                      </div>
                    </div>
                    {chapter && (
                      <p className="text-sm mt-1.5"><span className="font-bold">Chapters:</span> {chapter}</p>
                    )}
                  </div>

                  {/* ── General Instructions ── */}
                  <div className="mb-5">
                    <p className="font-bold text-sm mb-0.5">General Instructions:</p>
                    <p className="text-xs italic text-gray-600 mb-2">Read the following instructions very carefully and strictly follow them:</p>
                    <div className="ml-4 space-y-0.5">
                      {instructions.map((instruction, index) => (
                        <p key={index} className="text-sm">
                          <span className="font-semibold mr-1">({toRomanLower(index + 1)})</span>
                          {instruction}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* ── Sections / Questions ── */}
                  <div className="mb-4">
                    {questionPaper?.sections && questionPaper.sections.length > 0 ? (
                      questionPaper.sections.map((section, sectionIdx) => {
                        const sectionTitle = section.title || section.name || `Section ${String.fromCharCode(65 + sectionIdx)}`
                        const isCbseSection = /section/i.test(sectionTitle)
                        let arDirectionShown = false

                        return (
                          <div key={sectionIdx} className="mb-6">
                            <div className={`${isCbseSection ? "text-center" : ""} border-t border-gray-300 pt-4 mb-3`}>
                              <h3 className="font-bold text-base tracking-wide">{sectionTitle}</h3>
                              {(section.instructions || section.marksInfo) && (
                                <div className={`flex ${section.marksInfo ? "justify-between" : "justify-start"} items-baseline mt-1 text-sm gap-4`}>
                                  {section.instructions && (
                                    <p className="italic text-gray-600 text-left">{section.instructions}</p>
                                  )}
                                  {section.marksInfo && (
                                    <p className="font-semibold whitespace-nowrap">{section.marksInfo}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              {section.questions.map((question, idx) => {
                                const isAR = question.type === "assertion_reasoning"
                                const showArDirection = isAR && !arDirectionShown
                                if (showArDirection) arDirectionShown = true

                                const questionText = normalizeScientificText(question.text || "")
                                const textParts = questionText.split(/\nOR\n|\n\nOR\n\n/)

                                return (
                                  <div key={getQuestionKey(question, idx, `section-${sectionIdx}`)}>
                                    {showArDirection && (
                                      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 text-sm">
                                        <p className="font-bold mb-1">Assertion – Reason Based Questions</p>
                                        <p className="italic text-gray-700 text-xs leading-relaxed">
                                          Direction: Two statements are given, one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the options (A), (B), (C) and (D).
                                        </p>
                                        <div className="mt-1.5 ml-2 space-y-0.5 text-xs text-gray-600">
                                          <p>(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).</p>
                                          <p>(B) Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of Assertion (A).</p>
                                          <p>(C) Assertion (A) is true, but Reason (R) is false.</p>
                                          <p>(D) Assertion (A) is false, but Reason (R) is true.</p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <span className="font-bold text-sm min-w-8 pt-0.5 shrink-0">
                                        {question.number || idx + 1}.
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between gap-2">
                                          <div className="flex-1 text-sm whitespace-pre-line wrap-break-word">
                                            {textParts.length > 1 ? (
                                              textParts.map((part, pi) => (
                                                <span key={pi}>
                                                  {pi > 0 && (
                                                    <span className="block text-center font-bold my-2">OR</span>
                                                  )}
                                                  {part.trim()}
                                                </span>
                                              ))
                                            ) : (
                                              questionText
                                            )}
                                          </div>
                                          {question.marks != null && (
                                            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap shrink-0 pt-0.5">
                                              [{question.marks}]
                                            </span>
                                          )}
                                        </div>

                                        {question.options && question.options.length > 0 && (
                                          <div className={`mt-2 ml-1 ${question.options.length <= 4 ? "grid grid-cols-2 gap-x-8 gap-y-1" : "space-y-1"}`}>
                                            {question.options.map((option, oi) => (
                                              <p key={oi} className="text-sm">
                                                ({String.fromCharCode(65 + oi)}) {normalizeScientificText(option)}
                                              </p>
                                            ))}
                                          </div>
                                        )}

                                        {question.orText && (
                                          <div className="my-3">
                                            <p className="text-center font-bold text-sm my-2">OR</p>
                                            <p className="text-sm whitespace-pre-line wrap-break-word">
                                              {normalizeScientificText(question.orText)}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="space-y-4">
                        {questions.map((question, idx) => (
                          <div key={getQuestionKey(question, idx, "flat")} className="flex gap-2">
                            <span className="font-bold text-sm min-w-8 pt-0.5 shrink-0">
                              {question.number || idx + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <p className="flex-1 text-sm whitespace-pre-line wrap-break-word">
                                  {normalizeScientificText(question.text)}
                                </p>
                                {question.marks != null && (
                                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap shrink-0 pt-0.5">
                                    [{question.marks}]
                                  </span>
                                )}
                              </div>
                              {question.options && question.options.length > 0 && (
                                <div className={`mt-2 ml-1 ${question.options.length <= 4 ? "grid grid-cols-2 gap-x-8 gap-y-1" : "space-y-1"}`}>
                                  {question.options.map((option, oi) => (
                                    <p key={oi} className="text-sm">
                                      ({String.fromCharCode(65 + oi)}) {normalizeScientificText(option)}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {question.orText && (
                                <div className="my-3">
                                  <p className="text-center font-bold text-sm my-2">OR</p>
                                  <p className="text-sm whitespace-pre-line wrap-break-word">
                                    {normalizeScientificText(question.orText)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
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
                              <div key={getQuestionKey(question, idx, `section-${sectionIdx}`)} className="space-y-2">
                                <p className="font-semibold wrap-break-word">
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
                          <div key={getQuestionKey(question, idx, "flat")} className="space-y-2">
                            <p className="font-semibold wrap-break-word">
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
                </>
              )}
            </div>

            {/* Footer Actions */}
        <div className="shrink-0 border-t border-gray-200">
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
                disabled={isSaving || assessment?.status === "draft"}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-default"
              >
                <FileText size={18} /> {assessment?.status === "draft" ? "Saved" : isSaving ? "Saving..." : "Save draft"}
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
                disabled={isSaving || assessment?.status === "draft"}
                className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-default hover:bg-[#D5D2E3]"
              >
                <FileText size={18} /> {assessment?.status === "draft" ? "Saved" : isSaving ? "Saving..." : "Save draft"}
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
