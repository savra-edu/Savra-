"use client"

import { useParams } from "next/navigation"
import { useFetch } from "@/hooks/use-api"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"
import { downloadLessonPlanDoc } from "@/lib/doc-generator"
import { DownloadDropdown } from "@/components/download-dropdown"
import { Lesson } from "@/types/api"

export default function SharedLessonPlanPage() {
  const params = useParams()
  const token = params?.token as string | undefined

  const { data: lesson, isLoading, error } = useFetch<Lesson>(
    token ? `/public/lessons/${encodeURIComponent(token)}` : null
  )

  const handleDownloadPDF = () => {
    if (lesson) {
      const { url, filename } = generateLessonPlanPDF(lesson, "")
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    }
  }

  const handleDownloadWord = () => {
    if (lesson) downloadLessonPlanDoc(lesson, "")
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

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600 text-center">
          {error || "Lesson plan not found or no longer available."}
        </p>
      </div>
    )
  }

  const subject = lesson.subject?.name || "—"
  const grade = lesson.class ? `Grade ${lesson.class.grade}${lesson.class.section}` : "—"
  const topic = lesson.topic || "—"
  const periods = lesson.periods || []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#242220]">{lesson.title || "Lesson Plan"}</h1>
            <p className="text-gray-600 mt-1">{subject} • {grade} • {topic}</p>
          </div>
          <DownloadDropdown
            onDownloadPDF={handleDownloadPDF}
            onDownloadWord={handleDownloadWord}
            label="Download"
            className="shrink-0"
          />
        </div>

        {lesson.objective && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-2">Objective</p>
            <p className="text-gray-700">{lesson.objective}</p>
          </div>
        )}

        <div className="space-y-6">
          {periods.map((period) => (
            <div key={period.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#F5F5F5] px-6 py-3 font-semibold">
                Period {period.periodNo}
              </div>
              <div className="px-6 py-4 space-y-4">
                {period.concept && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Concept</p>
                    <p className="mt-1">{period.concept}</p>
                  </div>
                )}
                {period.learningOutcomes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Learning Outcomes</p>
                    <p className="mt-1 whitespace-pre-wrap">{period.learningOutcomes}</p>
                  </div>
                )}
                {period.teacherLearningProcess && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teacher-Learning Process</p>
                    <p className="mt-1 whitespace-pre-wrap">{period.teacherLearningProcess}</p>
                  </div>
                )}
                {period.assessment && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assessment</p>
                    <p className="mt-1 whitespace-pre-wrap">{period.assessment}</p>
                  </div>
                )}
                {period.resources && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resources</p>
                    <p className="mt-1 whitespace-pre-wrap">{period.resources}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
