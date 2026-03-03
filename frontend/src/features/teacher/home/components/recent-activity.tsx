"use client"

import { useState, useRef, useEffect } from "react"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/use-api"

interface RecentLesson {
  id: string
  title: string
  status: string
  createdAt: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
}

interface RecentQuiz {
  id: string
  title: string
  status: string
  createdAt: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
}

interface RecentData {
  recentLessons: RecentLesson[]
  recentQuizzes: RecentQuiz[]
  recentAttempts: Array<{
    id: string
    score: number
    totalMarks: number
    status: string
    submittedAt: string
    studentName?: string
    quizTitle?: string
  }>
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day"
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
  return `${Math.floor(diffDays / 30)} months`
}

export function RecentActivity() {
  const router = useRouter()
  const { data, isLoading, error } = useFetch<RecentData>("/teacher/dashboard/recent")

  // Combine lessons and quizzes into activities
  const activities = [
    ...(data?.recentLessons || []).map(lesson => ({
      id: lesson.id,
      type: "Lesson" as const,
      title: lesson.title || lesson.subject?.name || "Untitled",
      duration: formatTimeAgo(lesson.createdAt),
      status: lesson.status,
      href: `/lesson-plan/edit?id=${lesson.id}`
    })),
    ...(data?.recentQuizzes || []).map(quiz => ({
      id: quiz.id,
      type: "Quiz" as const,
      title: quiz.title || quiz.subject?.name || "Untitled",
      duration: formatTimeAgo(quiz.createdAt),
      status: quiz.status,
      href: `/quiz/generated?id=${quiz.id}`
    }))
  ].sort((a, b) => 0) // Keep original order from API

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  const handleDownload = (e: React.MouseEvent, activity: { type: string; href: string; title: string }) => {
    e.stopPropagation() // Prevent card click
    // Open in new tab for printing/downloading
    window.open(`${activity.href}&print=true`, '_blank')
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScrollButtons()
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)
      
      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 224 + 16 // w-56 (224px) + gap-4 (16px)
      const scrollAmount = cardWidth * 2 // Scroll 2 cards at a time
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth"
      })
    }
  }

  return (
    <section 
      className="mt-6 relative w-full rounded-[43px]"
      style={{
        backgroundImage: 'url(/recent-activity-bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-[#353535]">Recent Activity</h2>
          <Link href="/home/see-all" className="text-[#353535] text-sm font-medium">
            See all
          </Link>
        </div>
        
        <div className="relative w-full overflow-hidden -mx-6 px-6 flex-1 min-h-0">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar pr-12"
          style={{ scrollBehavior: "smooth" }}
          onScroll={checkScrollButtons}
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-white rounded-2xl p-6 w-56 border border-[#DFDFDF33] animate-pulse"
              >
                <div className="mb-8">
                  <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            // Empty state
            <div className="flex-shrink-0 bg-white rounded-2xl p-6 w-full border border-[#DFDFDF33] text-center">
              <p className="text-[#727272]">No recent activity yet. Create your first lesson or quiz!</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleCardClick(activity.href)}
                className="flex-shrink-0 bg-white rounded-2xl p-6 w-56 border border-[#DFDFDF33] cursor-pointer hover:shadow-lg hover:border-[#9B61FF] transition-all duration-200 relative"
              >
                {/* Status Badge */}
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                    activity.status === "published"
                      ? "bg-[#D4EDDA] text-[#155724]"
                      : activity.status === "saved"
                      ? "bg-[#EFFBE1] text-[#353535]"
                      : "bg-[#FEEBD4] text-[#353535]"
                  }`}
                >
                  {activity.status === "published" ? "Published" : activity.status === "saved" ? "Saved" : "Draft"}
                </span>
                <div className="mb-8 pr-16">
                  <p className="text-sm text-[#727272]">{activity.type}</p>
                  <h3 className="text-xl text-[#353535] line-clamp-2">{activity.title}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#727272]">Created</p>
                    <p className="text-xl text-[#353535]">{activity.duration}</p>
                  </div>
                  <button
                    onClick={(e) => handleDownload(e, activity)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download strokeWidth={2.5} className="text-gray-600 w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
        </div>
      </div>
    </section>
  )
}
