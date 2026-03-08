"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, Share2, Printer, Check } from "lucide-react"
import { api } from "@/lib/api"
import { useFetch } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { Lesson, LessonPeriod } from "@/types/api"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"
import { downloadLessonPlanDoc } from "@/lib/doc-generator"
import { DownloadDropdown } from "@/components/download-dropdown"
import { getAppBaseUrl } from "@/lib/app-url"
import { PeriodTable } from "./period-table"

interface EditLessonDetailsProps {
  isEditMode?: boolean
  lesson?: Lesson | null
  onSave?: () => void
}

export default function EditLessonDetails({ isEditMode = false, lesson: propLesson, onSave }: EditLessonDetailsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get("id")
  const { user } = useAuth()
  
  // Fetch lesson data if lessonId is provided
  const { data: fetchedLesson, isLoading: isLoadingLesson, refetch: refetchLesson } = useFetch<Lesson>(
    lessonId ? `/lessons/${lessonId}` : null
  )
  
  const lesson = propLesson || fetchedLesson
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    coreExplanation: false,
  })

  // New fields state
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [topic, setTopic] = useState<string>("")
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(1)
  const [periods, setPeriods] = useState<LessonPeriod[]>([])
  const [linkCopied, setLinkCopied] = useState(false)

  // Initialize state from lesson data
  useEffect(() => {
    if (lesson) {
      setStartDate(lesson.startDate || null)
      setEndDate(lesson.endDate || null)
      setTopic(lesson.topic || "")
      setNumberOfPeriods(lesson.numberOfPeriods || 1)
      const lessonPeriods = lesson.periods || []
      setPeriods(lessonPeriods)
    }
  }, [lesson])


  // Auto-generate periods when numberOfPeriods changes (only when we need placeholders)
  // Do NOT overwrite periods that were just loaded from the API — avoids race where
  // this effect replaces fetched content with empty placeholders (especially on prod)
  useEffect(() => {
    const apiPeriods = lesson?.periods || []
    if (apiPeriods.length >= numberOfPeriods && apiPeriods.some((p) => p.concept || p.learningOutcomes)) {
      return // API already provided periods with content — don't overwrite
    }
    if (numberOfPeriods > 0 && periods.length < numberOfPeriods) {
      const newPeriods: LessonPeriod[] = [...periods]
      for (let i = periods.length + 1; i <= numberOfPeriods; i++) {
        newPeriods.push({
          id: `temp-${i}`,
          lessonId: lessonId || "",
          periodNo: i,
        })
      }
      setPeriods(newPeriods)
    } else if (numberOfPeriods < periods.length) {
      setPeriods(periods.slice(0, numberOfPeriods))
    }
  }, [numberOfPeriods, lesson?.periods])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleModifyPrompt = () => {
    router.push(`/lesson-plan/edit/modify?id=${lessonId}`)
  }

  const handleSaveLessonPlan = async () => {
    if (!lessonId) return

    setIsSaving(true)
    setSaveError(null)

    try {
      // Format dates for API
      const startDateISO = startDate ? new Date(startDate).toISOString() : null
      const endDateISO = endDate ? new Date(endDate).toISOString() : null

      // Use local periods state if available, otherwise fall back to lesson.periods
      // This handles the race condition where periods state hasn't been updated yet
      const effectivePeriods = periods.length > 0 ? periods : (lesson?.periods || [])

      // Prepare periods data - ensure we have valid data with content
      const periodsData = effectivePeriods
        .filter(p => {
          // Only include periods that have at least some content
          return p.periodNo && (
            p.concept ||
            p.learningOutcomes ||
            p.teacherLearningProcess ||
            p.assessment ||
            p.resources ||
            p.centurySkillsValueEducation ||
            p.realLifeApplication ||
            p.reflection
          )
        })
        .map(p => ({
          periodNo: p.periodNo,
          concept: p.concept || null,
          learningOutcomes: p.learningOutcomes || null,
          teacherLearningProcess: p.teacherLearningProcess || null,
          assessment: p.assessment || null,
          resources: p.resources || null,
          centurySkillsValueEducation: p.centurySkillsValueEducation || null,
          realLifeApplication: p.realLifeApplication || null,
          reflection: p.reflection || null,
        }))

      if (periodsData.length === 0) {
        console.error('WARNING: No periods with content to save!')
        setSaveError('No periods with content found. Please ensure your lesson plan has been generated.')
        setIsSaving(false)
        return
      }

      // Update lesson with all fields
      await api.put(`/lessons/${lessonId}`, {
        startDate: startDateISO,
        endDate: endDateISO,
        topic,
        numberOfPeriods,
        periods: periodsData,
      })

      // Update status only if it's not already "saved"
      if (lesson?.status !== "saved") {
        await api.patch(`/lessons/${lessonId}/status`, { status: "saved" })
      }

      // Refetch lesson data to sync with server and update local state
      // This ensures periods are properly loaded after save
      if (refetchLesson) {
        try {
          await refetchLesson()
        } catch (err) {
          console.warn('Background refetch failed:', err)
        }
      }
      
      onSave?.()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save lesson plan")
    } finally {
      setIsSaving(false)
    }
  }

  const getLessonWithPeriods = (): Lesson => ({
    ...lesson!,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    topic: topic || undefined,
    numberOfPeriods: numberOfPeriods || undefined,
    periods: periods.length > 0 ? periods : undefined,
  })

  const handleDownloadPDF = () => {
    if (!lesson) return
    if (periods.length > 0) {
      const { url, filename } = generateLessonPlanPDF(getLessonWithPeriods(), user?.name || "")
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } else {
      window.print()
    }
  }

  const handleDownloadWord = () => {
    if (!lesson || periods.length === 0) return
    downloadLessonPlanDoc(getLessonWithPeriods(), user?.name || "")
  }

  const handleShare = async () => {
    if (!lessonId || !lesson) return
    try {
      const res = await api.post<{ success: boolean; data: { shareToken: string } }>(
        `/lessons/${lessonId}/share`,
        {}
      )
      const shareToken = res?.data?.shareToken
      if (!shareToken) {
        alert("Unable to create share link. Save the lesson plan first.")
        return
      }
      const shareUrl = `${getAppBaseUrl()}/share/lesson/${shareToken}`
      if (navigator.share) {
        try {
          await navigator.share({
            title: lesson?.title || "Lesson Plan",
            text: `Check out this lesson plan: ${lesson?.title || "Lesson Plan"}`,
            url: shareUrl,
          })
          return
        } catch (err) {
          if ((err as Error).name !== "AbortError") console.error("Share failed:", err)
        }
      }
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create share link")
    }
  }

  // Parse content into sections if available
  const lessonContent = lesson?.content || ""
  const lessonTitle = lesson?.title || "Generated Lesson Plan"
  const lessonDuration = lesson?.duration ? `${lesson.duration} mins` : "45 mins"

  // Simple markdown to HTML converter
  const formatContent = (content: string): string => {
    if (!content) return ""

    // Escape HTML first to prevent XSS
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Convert markdown to HTML
    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

    // Lists - unordered
    html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>")

    // Lists - ordered
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return `<ul class="list-disc list-inside space-y-1 my-2">${match}</ul>`
    })

    // Line breaks - convert double newlines to paragraphs
    html = html
      .split(/\n\n+/)
      .map(para => {
        para = para.trim()
        if (!para) return ""
        // Don't wrap if already wrapped in a tag
        if (para.startsWith("<h") || para.startsWith("<ul") || para.startsWith("<ol")) {
          return para
        }
        return `<p>${para.replace(/\n/g, "<br>")}</p>`
      })
      .join("\n")

    return html
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile: Plan Name and Duration (Default View) */}
        <div className="flex-shrink-0 lg:hidden bg-[#E9E9E9] px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#242220]">{lessonTitle}</h2>
          <div className="flex items-center gap-4">
            <span className="text-base font-medium text-[#242220]">{lessonDuration}</span>
          </div>
        </div>

        {/* Title editor and formatting toolbar removed per requirements */}

        {/* Content - Lesson plan tables only */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 lg:px-12 py-4 lg:py-8 space-y-6">
            {isLoadingLesson ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : periods.length > 0 ? (
              <>
                {/* Lesson plan header info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-700 pb-2">
                  <span><strong>Teacher:</strong> {user?.name || "—"}</span>
                  <span><strong>Topic:</strong> {topic || lesson?.topic || "—"}</span>
                  <span><strong>No of periods:</strong> {numberOfPeriods}</span>
                </div>
                <PeriodTable
                  periods={periods}
                  onPeriodChange={setPeriods}
                  readOnly={!isEditMode}
                />
              </>
            ) : lessonContent ? (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection("introduction")}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 lg:gap-4 bg-gray-100 lg:bg-[#F5F5F5] rounded-lg transition"
                >
                  <span className="flex-1 text-left font-medium lg:font-semibold text-gray-900">{lessonTitle}</span>
                  <div className="text-purple-500">
                    {expandedSections.introduction ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                {expandedSections.introduction && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div
                      className="pt-4 prose prose-sm max-w-none text-gray-700
                        prose-headings:text-gray-900 prose-headings:font-bold
                        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                        prose-p:my-2 prose-ul:my-2 prose-ol:my-2
                        prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: formatContent(lessonContent) }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No lesson plan content yet. Generate content first.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-4 lg:px-12 py-4 lg:py-6 border-t border-gray-200">
          {/* Mobile: Stack buttons */}
          <div className="lg:hidden flex flex-col gap-4">
            {/* First Row: Print, Share */}
            <div className="flex justify-start items-center gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm">
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
              <button
                onClick={handleModifyPrompt}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#DF6647] text-[#DF6647] bg-white rounded-xl font-semibold hover:bg-[#DF6647]/10 transition-colors"
              >
                Modify Prompt
              </button>
              <DownloadDropdown
                onDownloadPDF={handleDownloadPDF}
                onDownloadWord={handleDownloadWord}
                label="Download"
                className="flex-1 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white border-0"
              />
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
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
            <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
              <Printer size={18} /> Print
            </button>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleModifyPrompt}
                className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium hover:bg-[#DF6647] hover:text-white transition-colors"
              >
                Modify Prompt
              </button>
              <button
                onClick={handleSaveLessonPlan}
                disabled={isSaving}
                className="px-6 py-2 text-sm bg-[#DF6647] text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Lesson Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
