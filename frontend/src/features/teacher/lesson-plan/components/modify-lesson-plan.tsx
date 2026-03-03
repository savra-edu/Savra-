"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, Share2, Download, Printer, Edit, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { useFetch } from "@/hooks/use-api"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Lesson } from "@/types/api"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"

interface LessonSection {
  title: string
  duration: string
  content: string[]
}

interface ModifyLessonPlanProps {
  lessonId?: string
}

function ModifyLessonPlanContent({ lessonId: propLessonId }: ModifyLessonPlanProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = propLessonId || searchParams.get("id")
  const { user } = useAuth()

  // Fetch lesson data
  const { data: lesson, isLoading, error } = useFetch<Lesson>(
    lessonId ? `/lessons/${lessonId}` : null
  )

  // State
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Handle print
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Generate PDF when lesson loads
  useEffect(() => {
    if (lesson && lesson.periods && lesson.periods.length > 0) {
      // Debug logging to understand what data we have
      const periodsWithContent = lesson.periods.filter(p =>
        p.concept || p.learningOutcomes || p.teacherLearningProcess ||
        p.assessment || p.resources
      )
      console.log('[ModifyLessonPlan] Lesson loaded:', {
        id: lesson.id,
        title: lesson.title,
        totalPeriods: lesson.periods.length,
        periodsWithContent: periodsWithContent.length,
        periods: lesson.periods.map(p => ({
          periodNo: p.periodNo,
          hasConcept: !!p.concept,
          conceptPreview: p.concept?.substring(0, 50) || '(empty)'
        }))
      })

      const { url } = generateLessonPlanPDF(lesson, user?.name || "")
      setPdfUrl(url)
    }

    // Cleanup: revoke object URL when component unmounts or lesson changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [lesson, user])

  // Handle download - Generate PDF
  const handleDownload = useCallback(() => {
    if (!lesson) return
    
    // Check if lesson has new template format
    if (lesson.periods && lesson.periods.length > 0) {
      const { url, filename } = generateLessonPlanPDF(lesson, user?.name || "")
      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Revoke URL after download
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } else {
      // Fallback to print for old format
      window.print()
    }
  }, [lesson, user])

  // Handle share
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: lesson?.title || "Lesson Plan",
      text: `Check out this lesson plan: ${lesson?.title || "Lesson Plan"}`,
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
  }, [lesson?.title])

  // Handle save lesson plan
  const handleSave = async () => {
    if (!lessonId || !lesson) return

    setIsSaving(true)
    setSaveError(null)

    try {
      console.log('[ModifyLessonPlan] handleSave - Saving lesson:', lessonId)

      // Save the periods data if they exist
      if (lesson.periods && lesson.periods.length > 0) {
        const periodsData = lesson.periods.map(p => ({
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

        console.log('[ModifyLessonPlan] Saving periods:', periodsData.map(p => ({
          periodNo: p.periodNo,
          hasConcept: !!p.concept,
          hasLearningOutcomes: !!p.learningOutcomes
        })))

        // Save periods via PUT endpoint
        await api.put(`/lessons/${lessonId}`, {
          periods: periodsData,
        })
      }

      // Then update status to saved
      await api.patch(`/lessons/${lessonId}/status`, { status: "saved" })
      console.log('[ModifyLessonPlan] Save successful')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('[ModifyLessonPlan] Save error:', err)
      setSaveError(err instanceof Error ? err.message : "Failed to save lesson plan")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle modify prompt
  const handleModifyPrompt = () => {
    router.push(`/lesson-plan/create?edit=${lessonId}`)
  }

  // Handle edit
  const handleEdit = () => {
    router.push(`/lesson-plan/edit?id=${lessonId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="mx-auto bg-white rounded-2xl shadow-sm p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
            <span className="ml-3 text-gray-600">Loading lesson plan...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="py-6">
        <div className="mx-auto bg-white rounded-2xl shadow-sm p-12">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">Lesson plan not found</p>
            <p className="text-sm mt-2">The lesson plan you're looking for doesn't exist or couldn't be loaded.</p>
            <button
              onClick={() => router.push("/lesson-plan")}
              className="mt-4 px-6 py-2 bg-[#DF6647] text-white rounded-lg font-medium"
            >
              Back to Lesson Plans
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Format date for display: "2nd Dec'25"
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear().toString().slice(-2)
      
      // Get ordinal suffix
      const ordinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
      }
      
      return `${ordinal(day)} ${month}'${year}`
    } catch {
      return dateString
    }
  }

  // Dynamic values
  const lessonTitle = lesson.title || "Lesson Plan"
  const lessonDuration = lesson.duration ? `${lesson.duration} minutes` : "45 minutes"
  // Handle content - it's a string in the API, so sections don't exist
  const sections: any[] = []

  // Check if lesson has new template format (periods)
  const hasNewTemplate = lesson.periods && lesson.periods.length > 0

  // Default sections if none from API (for backward compatibility)
  const displaySections = sections.length > 0 ? sections : [
    {
      title: "Introduction",
      duration: "5 mins",
      content: lesson.objective ? [lesson.objective] : ["No content available for this section."]
    }
  ]

  return (
    <div className="py-6">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg z-50">
          Lesson plan saved successfully!
        </div>
      )}

      {/* Error Toast */}
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg z-50">
          {saveError}
        </div>
      )}

      <div className="mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="bg-[#E9E9E9] px-12 py-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{lessonTitle}</h1>
            <span className="text-[#000000]">•</span>
            <span className="text-[#000000]">{lessonDuration}</span>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#E2DFF0] rounded-lg hover:opacity-80"
          >
            Edit <Edit size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-12 py-8 space-y-6">
          {/* New Template Format - Header Section */}
          {hasNewTemplate && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              {/* Title Block - Centered */}
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-gray-900">{lesson.subject?.name || "Subject"}</div>
                <div className="text-lg font-bold text-gray-900">Lesson Plan</div>
                <div className="text-lg font-bold text-gray-900">Grade {lesson.class?.grade || ""}</div>
              </div>

              {/* Date removed per requirements */}

              {/* Three Input Boxes */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-500 mb-1">Teacher Name</div>
                  <div className="text-sm font-medium text-gray-900">{user?.name || "N/A"}</div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-500 mb-1">Topic:</div>
                  <div className="text-sm font-medium text-gray-900">{lesson.topic || "-"}</div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-500 mb-1">No of periods required:</div>
                  <div className="text-sm font-medium text-gray-900">{lesson.numberOfPeriods || "-"}</div>
                </div>
              </div>

              {/* PDF Display */}
              {lesson.periods && lesson.periods.length > 0 && pdfUrl && (
                <div className="w-full mt-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full border-0"
                      title="Lesson Plan PDF"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy Format - Sections (for backward compatibility) */}
          {!hasNewTemplate && displaySections.map((section: LessonSection, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-4 flex items-center gap-4 bg-[#F5F5F5] transition"
              >
                <div>
                  <Image src="/images/intro.png" alt={section.title} width={30} height={50} />
                </div>
                <span className="flex-1 text-left font-semibold text-base text-gray-900">
                  {section.title} ({section.duration})
                </span>
                <div className="text-purple-500">
                  {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections[index] && (
                <div className="px-6 pb-6 border-t border-gray-200 space-y-4">
                  {section.content.map((item: string, contentIndex: number) => (
                    <p key={contentIndex} className="text-gray-700 text-sm pt-4">
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Show message if no content and no periods */}
          {!hasNewTemplate && displaySections.length === 0 && (
            <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              <p>No lesson content available.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-12 py-6 border-t border-gray-200 flex items-center gap-3 flex-wrap">
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

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleModifyPrompt}
              className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium"
            >
              Modify Prompt
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm bg-[#DF6647] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Lesson Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="py-6">
      <div className="mx-auto bg-white rounded-2xl shadow-sm p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
          <span className="ml-3 text-gray-600">Loading lesson plan...</span>
        </div>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary
export default function ModifyLessonPlan({ lessonId }: ModifyLessonPlanProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ModifyLessonPlanContent lessonId={lessonId} />
    </Suspense>
  )
}
