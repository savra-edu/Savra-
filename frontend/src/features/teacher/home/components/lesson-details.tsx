"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Share2, Printer, FileText, Edit, Check } from "lucide-react"
import Image from "next/image"
import { useFetch } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { getAppBaseUrl } from "@/lib/app-url"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"
import { downloadLessonPlanDoc } from "@/lib/doc-generator"
import { DownloadDropdown } from "@/components/download-dropdown"
import { Lesson } from "@/types/api"

function parseItemId(itemId: string | undefined): { type: string; realId: string } | null {
  if (!itemId || !itemId.includes("-")) return null
  const firstDash = itemId.indexOf("-")
  const type = itemId.substring(0, firstDash)
  const realId = itemId.substring(firstDash + 1)
  if (!realId || !["lesson", "quiz", "assessment"].includes(type)) return null
  return { type, realId }
}

export default function LessonDetails() {
  const params = useParams()
  const router = useRouter()
  const itemId = params?.lesson as string | undefined
  const parsed = parseItemId(itemId)
  const isLesson = parsed?.type === "lesson"
  const lessonId = parsed?.type === "lesson" ? parsed.realId : null

  const { user } = useAuth()
  const { data: lesson, isLoading: isLoadingLesson } = useFetch<Lesson>(
    lessonId ? `/lessons/${lessonId}` : null
  )

  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    coreExplanation: false,
  })
  const [linkCopied, setLinkCopied] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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

  const handleDownloadPDF = () => {
    if (!lesson) return
    const { url, filename } = generateLessonPlanPDF(lesson, user?.name || "")
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const handleDownloadWord = () => {
    if (!lesson) return
    downloadLessonPlanDoc(lesson, user?.name || "")
  }

  const handleEdit = () => {
    if (lessonId) router.push(`/lesson-plan/edit?id=${lessonId}`)
  }

  const canShareDownload = isLesson && lesson && !isLoadingLesson

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="bg-[#E9E9E9] px-12 py-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {lesson ? `${lesson.class?.grade || ""}-${lesson.class?.section || ""}'s Lesson Plan On ${lesson.topic || lesson.title || "Fraction"}` : "7-B's Lesson Plan On Fraction"}
            </h1>
            <span className="text-[#000000]">•</span>
            <span className="text-[#000000]">{lesson?.duration ? `${lesson.duration} mins` : "45 minutes"}</span>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#E2DFF0] rounded-lg hover:opacity-80"
          >
            Edit <Edit size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-12 py-8 space-y-4">
          {/* Introduction Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("introduction")}
              className="w-full px-6 py-4 flex items-center gap-4 bg-[#F5F5F5] transition"
            >
              <div>
                <Image src="/images/intro.png" alt="Introduction" width={30} height={50} />
              </div>
              <span className="flex-1 text-left font-semibold text-basetext-gray-900">Introduction (5 mins)</span>
              <div className="text-purple-500">
                {expandedSections.introduction ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {expandedSections.introduction && (
              <div className="px-6 pb-6 border-t border-gray-200 space-y-4">
                <h3 className="text-base font-bold text-gray-900 pt-4">
                  {lesson?.periods?.[0]?.concept || "What is Fraction?"}
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm ml-2">
                  <li>Think about sharing one pizza equally between two friends.</li>
                  <li>What do we do to share it fairly? We divide it into equal parts.</li>
                  <li>Each equal part of a whole is called a fraction.</li>
                  <li>When a whole is divided into two equal parts, each part is written as ½.</li>
                  <li>This means one part taken out of two equal parts.</li>
                  <li>If a whole is divided into four equal parts, one part is written as ¼.</li>
                  <li>We use fractions when sharing food, time, or objects in daily life.</li>
                  <li>Today, we will learn what fractions are and how to use them correctly.</li>
                </ol>
                <p className="text-gray-700 text-sm mt-4">
                  {lesson?.periods?.[0]?.learningOutcomes || "Fractions are used to represent parts of a whole when something is divided into equal parts."}
                </p>
              </div>
            )}
          </div>

          {/* Core Explanation Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("coreExplanation")}
              className="w-full px-6 py-4 flex items-center gap-4 bg-[#F5F5F5] transition"
            >
              <div>
                <Image src="/images/intro.png" alt="Introduction" width={30} height={50} />
              </div>
              <span className="flex-1 text-left font-semibold text-gray-900">Core Explanation (20 mins)</span>
              <div className="text-purple-500">
                {expandedSections.coreExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-12 py-6 border-t border-gray-200 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleShare}
            disabled={!canShareDownload}
            className={`flex text-sm items-center gap-2 px-4 py-2 rounded-lg font-medium ${canShareDownload ? "bg-[#E2DFF0] text-gray-700 hover:bg-[#D5D2E3]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
            {linkCopied ? "Copied!" : "Share"}
          </button>
          {canShareDownload ? (
            <DownloadDropdown
              onDownloadPDF={handleDownloadPDF}
              onDownloadWord={handleDownloadWord}
              label="Download"
              className="bg-[#E2DFF0] border-0 text-gray-700 hover:bg-[#D5D2E3]"
            />
          ) : (
            <button
              disabled
              className="flex text-sm items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed"
            >
              Download
            </button>
          )}
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]">
            <Printer size={18} /> Print
          </button>
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium hover:bg-[#D5D2E3]">
            <FileText size={18} /> Draft
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => lessonId && router.push(`/lesson-plan/edit/modify?id=${lessonId}`)}
              className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium hover:bg-[#DF6647]/10"
            >
              Modify Prompt
            </button>
            <button className="px-6 py-2 text-sm bg-[#DF6647] text-white rounded-lg font-medium hover:opacity-90">
              Save Lesson Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
