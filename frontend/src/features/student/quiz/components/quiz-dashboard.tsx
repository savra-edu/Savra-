"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TaskCard } from "@/features/student/home/components/task-card"
import { useStudentQuizzesPaginated, QuizListItem, QuizFilters } from "@/hooks/use-quiz"

// Helper to determine badge styling based on quiz status
function getQuizBadgeInfo(quiz: QuizListItem) {
  const today = new Date()
  const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null

  // Completed quizzes
  if (quiz.attemptStatus === "submitted" || quiz.attemptStatus === "graded") {
    const percentage = quiz.latestPercentage !== null ? Number(quiz.latestPercentage) : null
    return {
      badge: "Completed",
      badgeColor: "bg-gray-300",
      cardBg: "bg-stone-50",
      badgeBg: "bg-stone-100",
      buttonText: "View Results",
      subtitle: percentage !== null && !isNaN(percentage)
        ? `Score: ${percentage.toFixed(0)}%`
        : "Completed",
      disabled: false,
    }
  }

  // In progress
  if (quiz.attemptStatus === "in_progress") {
    return {
      badge: "In Progress",
      badgeColor: "bg-blue-300",
      cardBg: "bg-blue-50",
      badgeBg: "bg-blue-100",
      buttonText: "Continue Quiz",
      subtitle: quiz.timeLimit ? `${quiz.timeLimit} Mins` : "Continue",
      disabled: false,
    }
  }

  // Optional quizzes
  if (quiz.isOptional) {
    return {
      badge: "Optional",
      badgeColor: "bg-[#BED7C1]",
      cardBg: "bg-[#F1F8F5]",
      badgeBg: "bg-[#E6F4EE]",
      buttonText: "Start Quiz",
      subtitle: quiz.timeLimit ? `${quiz.timeLimit} Mins | Optional` : "Optional",
      disabled: false,
    }
  }

  // Check due date
  if (dueDate) {
    const isToday = dueDate.toDateString() === today.toDateString()
    const isPast = dueDate < today && !isToday
    const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === dueDate.toDateString()

    if (isPast) {
      return {
        badge: "Overdue",
        badgeColor: "bg-red-300",
        cardBg: "bg-red-50",
        badgeBg: "bg-red-100",
        buttonText: "Start Quiz",
        subtitle: `${quiz.timeLimit || 0} Mins | Overdue`,
        disabled: false,
      }
    }

    if (isToday) {
      return {
        badge: "Due Today",
        badgeColor: "bg-[#F2AD8A]",
        cardBg: "bg-[#FDF2F1]",
        badgeBg: "bg-[#FDEAE3]",
        buttonText: "Start Quiz",
        subtitle: `${quiz.timeLimit || 0} Mins | Due today`,
        disabled: false,
      }
    }

    if (isTomorrow) {
      return {
        badge: "Upcoming",
        badgeColor: "bg-green-200",
        cardBg: "bg-green-50",
        badgeBg: "bg-green-100",
        buttonText: "Start Quiz",
        subtitle: "Available tomorrow",
        disabled: false,
      }
    }
  }

  // Default - upcoming
  return {
    badge: "Upcoming",
    badgeColor: "bg-green-200",
    cardBg: "bg-green-50",
    badgeBg: "bg-green-100",
    buttonText: "Start Quiz",
    subtitle: dueDate
      ? `Due ${dueDate.toLocaleDateString()}`
      : quiz.timeLimit
        ? `${quiz.timeLimit} Mins`
        : "Available",
    disabled: false,
  }
}

// Map UI filter to API badge
function mapFilterToBadge(filter: string): string | undefined {
  switch (filter) {
    case "Due Today":
    case "Upcoming":
    case "Completed":
    case "In Progress":
    case "Optional":
      return filter
    default:
      return undefined
  }
}

// Loading skeleton for quiz cards
function QuizCardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-100 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-t-xl"></div>
      <div className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

interface QuizDashboardProps {
  subjectId?: string
  searchQuery?: string
}

export default function QuizDashboard({ subjectId, searchQuery }: QuizDashboardProps) {
  const [sortBy, setSortBy] = useState<string>("All")
  const [page, setPage] = useState(1)
  const limit = 12

  // Build filters
  const filters: QuizFilters = {}
  if (subjectId) filters.subjectId = subjectId

  const { data: quizzes, isLoading, error, pagination } = useStudentQuizzesPaginated(
    page,
    limit,
    filters
  )

  // Client-side filter by badge (since API doesn't support status filter directly)
  const filteredQuizzes = quizzes?.filter(quiz => {
    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!quiz.title.toLowerCase().includes(query) &&
          !quiz.subject.name.toLowerCase().includes(query)) {
        return false
      }
    }

    // Apply status filter
    if (sortBy === "All") return true

    const badgeInfo = getQuizBadgeInfo(quiz)
    return badgeInfo.badge === sortBy
  }) || []

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1)
  }

  return (
    <div className="w-full lg:border lg:border-black lg:rounded-lg mt-4 lg:mt-6 flex flex-col overflow-hidden flex-1 min-h-0">
      {/* Header Section - Desktop Only */}
      <div className="hidden lg:flex flex-row justify-between items-center p-6 flex-shrink-0">
        <div>
          <h1 className="text-sm font-normal text-[#353535]">
            {pagination ? `${pagination.total} quizzes` : "All"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-[#353535]">sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Due Today">Due Today</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Sort Section */}
      <div className="lg:hidden flex justify-end items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-[#353535]">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Due Today">Due Today</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="lg:p-6 p-2 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            Failed to load quizzes. Please try again.
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => {
              const badgeInfo = getQuizBadgeInfo(quiz)
              return (
                <TaskCard
                  key={quiz.id}
                  badge={badgeInfo.badge}
                  badgeColor={badgeInfo.badgeColor}
                  title={`${quiz.subject.name} - ${quiz.title}`}
                  subtitle={badgeInfo.subtitle}
                  buttonText={badgeInfo.buttonText}
                  cardBg={badgeInfo.cardBg}
                  badgeBg={badgeInfo.badgeBg}
                  disabled={badgeInfo.disabled}
                  href={!badgeInfo.disabled ? `/quizzes/${quiz.id}` : undefined}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No quizzes found for this filter.
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
