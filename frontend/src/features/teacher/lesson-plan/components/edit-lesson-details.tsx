"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, Share2, Download, Printer } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useFetch } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { Lesson, LessonPeriod } from "@/types/api"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Initialize state from lesson data
  useEffect(() => {
    if (lesson) {
      setStartDate(lesson.startDate || null)
      setEndDate(lesson.endDate || null)
      setTopic(lesson.topic || "")
      setNumberOfPeriods(lesson.numberOfPeriods || 1)
      const lessonPeriods = lesson.periods || []
      setPeriods(lessonPeriods)
      console.log('Lesson loaded with periods:', {
        count: lessonPeriods.length,
        periods: lessonPeriods.map(p => ({
          periodNo: p.periodNo,
          hasConcept: !!p.concept,
          hasLearningOutcomes: !!p.learningOutcomes,
          hasTeacherProcess: !!p.teacherLearningProcess,
          hasContent: !!(p.concept || p.learningOutcomes || p.teacherLearningProcess || p.assessment || p.resources)
        }))
      })
    }
  }, [lesson])

  // Generate PDF when periods change or lesson loads
  useEffect(() => {
    // Use local periods state if available, otherwise fall back to lesson.periods
    // This handles the race condition where periods state hasn't been updated yet
    const effectivePeriods = periods.length > 0 ? periods : (lesson?.periods || [])

    // Only generate PDF if we have both lesson data and periods with actual content
    const periodsWithContent = effectivePeriods.filter(p =>
      p.concept ||
      p.learningOutcomes ||
      p.teacherLearningProcess ||
      p.assessment ||
      p.resources ||
      p.centurySkillsValueEducation ||
      p.realLifeApplication ||
      p.reflection
    )

    if (lesson && effectivePeriods.length > 0 && periodsWithContent.length > 0) {
      // Revoke previous URL if exists (but only if we're generating a new one)
      const previousUrl = pdfUrl

      // Create lesson object with current state
      const lessonWithPeriods: Lesson = {
        ...lesson,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        topic: topic || undefined,
        numberOfPeriods: numberOfPeriods || undefined,
        periods: effectivePeriods,
      }

      try {
        console.log('Generating PDF with periods:', {
          total: effectivePeriods.length,
          withContent: periodsWithContent.length,
          source: periods.length > 0 ? 'state' : 'lesson',
          periods: effectivePeriods.map(p => ({
            periodNo: p.periodNo,
            hasContent: !!(p.concept || p.learningOutcomes || p.teacherLearningProcess)
          }))
        })

        const { url } = generateLessonPlanPDF(lessonWithPeriods, user?.name || "")
        // Only revoke previous URL after successfully creating new one
        if (previousUrl && previousUrl !== url) {
          URL.revokeObjectURL(previousUrl)
        }
        setPdfUrl(url)
        console.log('PDF generated successfully')
      } catch (error) {
        console.error('Error generating PDF:', error)
        // Keep the previous PDF URL if generation fails
      }
    } else {
      console.warn('Cannot generate PDF:', {
        hasLesson: !!lesson,
        periodsCount: effectivePeriods.length,
        periodsWithContentCount: periodsWithContent.length
      })
    }
    // Note: We intentionally don't clear pdfUrl if periods become empty temporarily
    // This prevents the PDF from disappearing during save/refetch operations
  }, [lesson, periods, startDate, endDate, topic, numberOfPeriods, user])

  // Separate cleanup effect for unmount only
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  // Auto-generate periods when numberOfPeriods changes
  useEffect(() => {
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
  }, [numberOfPeriods])

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

      console.log('Saving lesson plan with periods:', {
        totalPeriods: effectivePeriods.length,
        periodsWithContent: periodsData.length,
        source: periods.length > 0 ? 'state' : 'lesson',
        periods: periodsData.map(p => ({
          periodNo: p.periodNo,
          hasConcept: !!p.concept,
          hasLearningOutcomes: !!p.learningOutcomes,
          hasTeacherProcess: !!p.teacherLearningProcess,
          hasContent: !!(p.concept || p.learningOutcomes || p.teacherLearningProcess || p.assessment || p.resources)
        }))
      })

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
      
      // Manually regenerate PDF immediately after save with current periods
      // This ensures the PDF is updated without waiting for refetch
      // Use the periods that were just saved (from periodsData, not state, to ensure we have the latest)
      if (lesson && periodsData.length > 0) {
        const previousUrl = pdfUrl
        
        // Convert periodsData back to LessonPeriod format for PDF generation
        const periodsForPdf: LessonPeriod[] = periodsData.map((p, idx) => ({
          id: periods[idx]?.id || `temp-${p.periodNo}`,
          lessonId: lessonId || "",
          periodNo: p.periodNo,
          concept: p.concept || undefined,
          learningOutcomes: p.learningOutcomes || undefined,
          teacherLearningProcess: p.teacherLearningProcess || undefined,
          assessment: p.assessment || undefined,
          resources: p.resources || undefined,
          centurySkillsValueEducation: p.centurySkillsValueEducation || undefined,
          realLifeApplication: p.realLifeApplication || undefined,
          reflection: p.reflection || undefined,
        }))
        
        const lessonWithPeriods: Lesson = {
          ...lesson,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          topic: topic || undefined,
          numberOfPeriods: numberOfPeriods || undefined,
          periods: periodsForPdf, // Use periodsData that was just saved
        }
        
        try {
          console.log('Regenerating PDF with periods:', periodsForPdf.map(p => ({
            periodNo: p.periodNo,
            hasConcept: !!p.concept,
            hasLearningOutcomes: !!p.learningOutcomes,
            hasTeacherProcess: !!p.teacherLearningProcess
          })))
          
          const { url } = generateLessonPlanPDF(lessonWithPeriods, user?.name || "")
          if (previousUrl && previousUrl !== url) {
            URL.revokeObjectURL(previousUrl)
          }
          setPdfUrl(url)
          console.log('PDF regenerated after save with', periodsForPdf.length, 'periods')
        } catch (error) {
          console.error('Error regenerating PDF after save:', error)
        }
      } else {
        console.warn('Cannot regenerate PDF: lesson or periods missing', { 
          hasLesson: !!lesson, 
          periodsDataCount: periodsData.length,
          periodsStateCount: periods.length
        })
      }
      
      // Refetch lesson data to sync with server and update local state
      // This ensures periods are properly loaded after save
      if (refetchLesson) {
        try {
          await refetchLesson()
          // The useEffect for lesson will automatically update periods state
          // and regenerate PDF if needed
          console.log('Lesson refetched after save')
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

  const handleDownload = () => {
    if (!lesson) return
    
    // Create lesson object with current state
    const lessonWithPeriods: Lesson = {
      ...lesson,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      topic: topic || undefined,
      numberOfPeriods: numberOfPeriods || undefined,
      periods: periods.length > 0 ? periods : undefined,
    }
    
    // Check if lesson has new template format
    if (periods.length > 0) {
      const { url, filename } = generateLessonPlanPDF(lessonWithPeriods, user?.name || "")
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 lg:px-12 py-4 lg:py-8 space-y-6">
            {/* Lesson Plan Information section removed per requirements */}
            
            {isLoadingLesson ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* PDF Display Section */}
                {periods.length > 0 && pdfUrl && (
                  <div className="w-full">
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="Lesson Plan PDF"
                      />
                    </div>
                  </div>
                )}

                {/* Legacy Content Section (for backward compatibility) - Only show if no periods/PDF */}
                {periods.length === 0 && (
                  lessonContent ? (
                    // Render actual lesson content from API
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
                  ) : null
                )}
              </>
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
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#B595FF] hover:bg-[#A085EF] text-white rounded-xl font-semibold text-sm">
                <Share2 size={18} /> Share
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
              <button 
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white rounded-xl font-semibold"
              >
                <Download size={18} /> Download
              </button>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
            <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
              <Share2 size={18} /> Share
            </button>
            <button 
              onClick={handleDownload}
              className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]"
            >
              <Download size={18} /> Download
            </button>
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
