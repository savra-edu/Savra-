"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs } from "@/components/tabs-section"
import { ContentItem } from "@/features/teacher/history/components/content-items"
import { SortDropdown } from "@/features/teacher/history/components/sort-dropdown"
import { SavraChatList } from "@/features/teacher/history/components/savra-chat-list"
import { queryKeys, useApiQuery } from "@/hooks/use-query"
import { appendHistorySource } from "@/lib/history-navigation"

const TABS = ["All", "Lessons", "Quizzes", "Question Papers", "Notice", "Savra AI"]

interface HistoryItem {
  id: string
  type: "lesson" | "quiz" | "assessment" | "announcement"
  title: string
  subject: string
  targetClass: string
  createdAt: string
  status?: string
}

interface HistoryResponse {
  items: HistoryItem[]
  total: number
}

let lastHistoryActiveTab = "All"
let lastHistorySortBy = "Date"

// Map tab names to API types
const TAB_TO_TYPE: Record<string, string> = {
  All: "all",
  Lessons: "lesson",
  Quizzes: "quiz",
  "Question Papers": "assessment",
  Notice: "announcement"
}

// Map types to badge display
const TYPE_TO_BADGE: Record<string, { label: string; color: "pink" | "blue" | "orange" }> = {
  lesson: { label: "Lesson", color: "blue" },
  quiz: { label: "Quiz", color: "pink" },
  assessment: { label: "Assessment", color: "blue" },
  announcement: { label: "Announcement", color: "orange" }
}

function getHistoryItemHref(type: string, id: string): string {
  switch (type) {
    case "lesson":
      return appendHistorySource(`/lesson-plan/edit?id=${id}`)
    case "quiz":
      return appendHistorySource(`/quiz/generated?id=${id}`)
    case "assessment":
      return appendHistorySource(`/assessments/create/question-paper?id=${id}`)
    case "announcement":
      return "/announcements"
    default:
      return "#"
  }
}

export default function HistoryHero() {
  const [activeTab, setActiveTab] = useState(lastHistoryActiveTab)
  const [sortBy, setSortBy] = useState(lastHistorySortBy)

  const apiType = TAB_TO_TYPE[activeTab] || "all"
  const sortParam = sortBy.toLowerCase()
  const isSavraAITab = activeTab === "Savra AI"

  const {
    data: historyResponse,
    isLoading,
    error,
  } = useApiQuery<HistoryResponse>({
    queryKey: queryKeys.teacherHistory(apiType, sortParam),
    endpoint: `/teacher/history?type=${apiType}&sort=${sortParam}`,
    enabled: !isSavraAITab,
  })

  useEffect(() => {
    lastHistoryActiveTab = activeTab
    lastHistorySortBy = sortBy
  }, [activeTab, sortBy])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    if (isToday) {
      return { date: "Today", time: timeStr }
    }

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })

    return { date: dateStr, time: timeStr }
  }

  const currentContent = useMemo(() => {
    const historyItems = historyResponse?.items || []

    if (!historyItems || historyItems.length === 0) return []

    return historyItems.map((item) => {
      const { date, time } = formatDateTime(item.createdAt)
      const badge = TYPE_TO_BADGE[item.type] || { label: "Item", color: "blue" as const }

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: `${item.targetClass} • ${item.subject}`,
        badge,
        date,
        time,
        href: getHistoryItemHref(item.type, item.id)
      }
    })
  }, [historyResponse])

  return (
    <div>
      <div className="mx-auto bg-white rounded-xl shadow-sm border border-[#DCDCDC] lg:border lg:border-[#DCDCDC]">
        {/* Header with Tabs and Sort */}
        <div className="px-4 lg:px-6 py-4 lg:py-6 text-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-[#353535]">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="hidden lg:block">
            <SortDropdown label="Sort By" options={["Date", "Title", "Class"]} selected={sortBy} onSelect={setSortBy} />
          </div>
        </div>

        {/* Savra AI Tab - Show chat list directly */}
        {isSavraAITab && <SavraChatList />}

        {/* Other Tabs - Show API content */}
        {!isSavraAITab && (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="px-4 lg:px-6 py-16 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="px-4 lg:px-6 py-16 text-center text-red-500">
                Failed to load history. Please try again.
              </div>
            )}

            {/* Content Items */}
            {!isLoading && !error && (
              <div>
                {currentContent.length > 0 ? (
                  currentContent.map((item) => (
                    <ContentItem
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      badge={item.badge}
                      date={item.date}
                      time={item.time}
                      href={item.href}
                    />
                  ))
                ) : (
                  <div className="px-4 lg:px-6 py-16 text-center text-gray-500">No content available for this tab</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
