"use client"

import { TaskCard } from "./task-card"
import { RecentNotices } from "./recent-notices"
import { Leaderboard } from "./leaderboard"
import { useStudentQuizzes, StudentQuiz } from "@/hooks/use-student"

// Helper to determine badge styling based on quiz status
function getQuizBadgeInfo(quiz: StudentQuiz) {
  const today = new Date()
  const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null
  const duration = quiz.timeLimit || 0

  // Check attempt status first
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
        : "Completed"
    }
  }

  if (quiz.attemptStatus === "in_progress") {
    return {
      badge: "In Progress",
      badgeColor: "bg-blue-300",
      cardBg: "bg-blue-50",
      badgeBg: "bg-blue-100",
      buttonText: "Continue Quiz",
      subtitle: duration ? `${duration} Mins` : "Continue"
    }
  }

  if (quiz.isOptional) {
    return {
      badge: "Optional",
      badgeColor: "bg-[#BED7C1]",
      cardBg: "bg-[#F1F8F5]",
      badgeBg: "bg-[#E6F4EE]",
      buttonText: "Start Quiz",
      subtitle: duration ? `${duration} Mins | Optional` : "Optional"
    }
  }

  if (dueDate) {
    const isToday = dueDate.toDateString() === today.toDateString()
    const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === dueDate.toDateString()
    const isPast = dueDate < today && !isToday

    if (isPast) {
      return {
        badge: "Overdue",
        badgeColor: "bg-red-300",
        cardBg: "bg-red-50",
        badgeBg: "bg-red-100",
        buttonText: "Start Quiz",
        subtitle: `${duration} Mins | Overdue`
      }
    }

    if (isToday) {
      return {
        badge: "Due Today",
        badgeColor: "bg-[#F2AD8A]",
        cardBg: "bg-[#FDF2F1]",
        badgeBg: "bg-[#FDEAE3]",
        buttonText: "Start Quiz",
        subtitle: `${duration} Mins | Due today`
      }
    }

    if (isTomorrow) {
      return {
        badge: "Upcoming",
        badgeColor: "bg-[#F7CD9F]",
        cardBg: "bg-[#FCF5ED]",
        badgeBg: "bg-[#FCF2E4]",
        buttonText: "Start Quiz",
        subtitle: "Available tomorrow"
      }
    }
  }

  // Default - upcoming
  return {
    badge: "Upcoming",
    badgeColor: "bg-[#F7CD9F]",
    cardBg: "bg-[#FCF5ED]",
    badgeBg: "bg-[#FCF2E4]",
    buttonText: "Start Quiz",
    subtitle: dueDate
      ? `Due ${dueDate.toLocaleDateString()}`
      : duration
        ? `${duration} Mins`
        : "Available"
  }
}

// Loading skeleton for task cards
function TaskCardSkeleton() {
  return (
    <div className="rounded-xl p-4 bg-gray-100 animate-pulse">
      <div className="h-6 w-20 bg-gray-200 rounded mb-3"></div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 w-full bg-gray-200 rounded"></div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: quizzes, isLoading, error } = useStudentQuizzes(3, "pending")

  return (
    <main className="mt-4 lg:mt-6">
      <div>
        {/* Today's Tasks Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-base lg:text-lg font-normal text-[#353535] mb-4 lg:mb-6">Today's Tasks</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </>
            ) : error ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Failed to load tasks. Please try again.
              </div>
            ) : quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const badgeInfo = getQuizBadgeInfo(quiz)
                return (
                  <TaskCard
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    badge={badgeInfo.badge}
                    badgeColor={badgeInfo.badgeColor}
                    title={`${quiz.subject.name}- ${quiz.title}`}
                    subtitle={badgeInfo.subtitle}
                    buttonText={badgeInfo.buttonText}
                    cardBg={badgeInfo.cardBg}
                    badgeBg={badgeInfo.badgeBg}
                  />
                )
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No pending tasks. Great job!
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Recent Notices & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          <div className="lg:col-span-3">
            <RecentNotices />
          </div>
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  )
}
