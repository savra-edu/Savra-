"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/use-api"

interface Assessment {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  createdAt: string
  totalMarks?: number
  difficultyLevel?: string
  status?: string
}

interface Quiz {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  createdAt: string
  totalQuestions?: number
  difficultyLevel?: string
  status?: string
}

interface AssessmentsResponse {
  assessments: Assessment[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface QuizzesResponse {
  quizzes: Quiz[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ActivityItem {
  id: string
  type: "Quiz" | "Question Paper"
  subject: string
  date: string
  classCode: string
  createdAt: Date
  link: string
}

export function Activity() {
  const router = useRouter()
  const { data: assessmentsResponse, isLoading: assessmentsLoading } = useFetch<AssessmentsResponse>("/assessments?limit=8")
  const { data: quizzesResponse, isLoading: quizzesLoading } = useFetch<QuizzesResponse>("/quizzes?limit=8")

  const assessments = assessmentsResponse?.assessments || []
  const quizzes = quizzesResponse?.quizzes || []
  const isLoading = assessmentsLoading || quizzesLoading

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
  }

  // Combine and sort by date
  const activities: ActivityItem[] = useMemo(() => {
    const assessmentItems: ActivityItem[] = assessments.map((assessment) => ({
      id: assessment.id,
      type: "Question Paper" as const,
      subject: assessment.title || assessment.subject?.name || "Assessment",
      date: formatDate(assessment.createdAt),
      classCode: assessment.class?.name || "N/A",
      createdAt: new Date(assessment.createdAt),
      link: `/assessments/create/question-paper?id=${assessment.id}`
    }))

    const quizItems: ActivityItem[] = quizzes.map((quiz) => ({
      id: quiz.id,
      type: "Quiz" as const,
      subject: quiz.title || quiz.subject?.name || "Quiz",
      date: formatDate(quiz.createdAt),
      classCode: quiz.class?.name || "N/A",
      createdAt: new Date(quiz.createdAt),
      link: `/quiz/generated?id=${quiz.id}`
    }))

    // Combine and sort by most recent first
    return [...assessmentItems, ...quizItems]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8)
  }, [assessments, quizzes])

  const handleCardClick = (link: string) => {
    router.push(link)
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

  const mobileScrollContainerRef = useRef<HTMLDivElement>(null)
  const [showMobileLeftArrow, setShowMobileLeftArrow] = useState(false)
  const [showMobileRightArrow, setShowMobileRightArrow] = useState(true)

  const checkMobileScrollButtons = () => {
    if (mobileScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollContainerRef.current
      setShowMobileLeftArrow(scrollLeft > 0)
      setShowMobileRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const container = mobileScrollContainerRef.current
    if (container) {
      checkMobileScrollButtons()
      container.addEventListener("scroll", checkMobileScrollButtons)
      window.addEventListener("resize", checkMobileScrollButtons)
      
      return () => {
        container.removeEventListener("scroll", checkMobileScrollButtons)
        window.removeEventListener("resize", checkMobileScrollButtons)
      }
    }
  }, [])

  const scrollMobile = (direction: "left" | "right") => {
    if (mobileScrollContainerRef.current) {
      const cardWidth = 160 + 16 // Approximate card width + gap
      const scrollAmount = cardWidth
      const currentScroll = mobileScrollContainerRef.current.scrollLeft
      const newScroll = direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      mobileScrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth"
      })
    }
  }

  return (
    <>
      {/* Mobile: Continue Working on Section */}
      <section className="lg:hidden mt-6">
        <h2 className="text-base font-semibold text-[#353535] mb-4">Continue Working on</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent assessments</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && activities.length > 0 && (
          <div className="relative w-full overflow-hidden">
            {/* Left Arrow */}
            {showMobileLeftArrow && (
              <button
                onClick={() => scrollMobile("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={mobileScrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
              style={{ scrollBehavior: "smooth" }}
              onScroll={checkMobileScrollButtons}
            >
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleCardClick(activity.link)}
                  className="flex-shrink-0 bg-white rounded-2xl p-4 border border-[#DFDFDF33] flex flex-col justify-between min-h-[120px] w-40 cursor-pointer hover:shadow-md hover:border-[#DF6647]/30 transition-all"
                >
                  <div className="mb-4">
                    <p className="text-sm text-[#727272]">{activity.type}</p>
                    <p className="text-base font-medium text-[#353535] mt-1 line-clamp-2">{activity.subject}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-[#727272]">Date</p>
                      <p className="text-base font-medium text-[#353535] mt-1">{activity.date}</p>
                    </div>
                    <Download strokeWidth={2.5} className="text-gray-900 w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {showMobileRightArrow && (
              <button
                onClick={() => scrollMobile("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Desktop: Recent Assessments Section */}
      <section
        className="hidden lg:block relative w-full rounded-[43px] overflow-hidden"
        style={{
          backgroundImage: 'url(/recent-activity-bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative z-10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-[#353535]">Recent Assessments</h2>
            <a href="/assessments" className="text-[#353535] text-sm font-medium">
              See all
            </a>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && activities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No recent assessments</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && activities.length > 0 && (
            <div className="relative w-full overflow-hidden -mx-6 px-6">
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
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleCardClick(activity.link)}
                    className="flex-shrink-0 bg-white rounded-2xl p-6 w-56 border border-[#DFDFDF33] cursor-pointer hover:shadow-lg hover:border-[#DF6647]/30 transition-all"
                  >
                    {/* Top Section */}
                    <div className="mb-4">
                      <p className="text-sm text-[#727272]">{activity.type}</p>
                      <h3 className="text-xl font-bold text-[#353535] mt-1 line-clamp-2">{activity.subject}</h3>
                      <p className="text-base text-[#353535] mt-2">{activity.date}</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-center">
                      <p className="text-base text-[#353535] font-medium">{activity.classCode}</p>
                      <Download strokeWidth={2.5} className="text-gray-900" />
                    </div>
                  </div>
                ))}
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
          )}
        </div>
      </section>
    </>
  )
}
