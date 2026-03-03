"use client"

import { useState, useMemo } from "react"
import { QuizTabs } from "./quiz-tabs"
import { QuizStats } from "./quiz-stats"
import { QuizAnalyticsChart } from "./quiz-analytics-chart"
import { StudentsList } from "./students-list"
import { TopQuestionsMissed } from "./top-questions"
import { InsightsSection } from "./insights-section"
import { RecommendedActions } from "./recommended-actions"
import { useFetch } from "@/hooks/use-api"

interface Quiz {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
  status: string
  createdAt: string
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

// Placeholder quizzes data
const PLACEHOLDER_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    title: "Fractions & Decimals Quiz",
    subject: { id: "subj-1", name: "Maths" },
    class: { id: "class-1", name: "Class 10 A", grade: 10, section: "A" },
    status: "published",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "quiz-2",
    title: "Algebra Basics Quiz",
    subject: { id: "subj-1", name: "Maths" },
    class: { id: "class-1", name: "Class 10 A", grade: 10, section: "A" },
    status: "published",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "quiz-3",
    title: "Geometry Fundamentals Quiz",
    subject: { id: "subj-1", name: "Maths" },
    class: { id: "class-1", name: "Class 10 A", grade: 10, section: "A" },
    status: "published",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function QuizAnalyticsDashboard() {
  const { data: response, isLoading: quizzesLoading } = useFetch<QuizzesResponse>("/quizzes?limit=5")
  const quizzes = (response?.quizzes && response.quizzes.length > 0) ? response.quizzes : PLACEHOLDER_QUIZZES

  const tabs = useMemo(() => {
    if (!quizzes || quizzes.length === 0) return ["No quizzes"]
    return quizzes.map(q => q.title)
  }, [quizzes])

  const [activeTab, setActiveTab] = useState<string | null>(null)

  // Set initial active tab when quizzes load
  const currentTab = activeTab || tabs[0]

  const activeQuiz = useMemo(() => {
    if (!quizzes) return null
    return quizzes.find(q => q.title === currentTab) || quizzes[0]
  }, [quizzes, currentTab])

  const quizId = activeQuiz?.id || null

  if (quizzesLoading) {
    return (
      <main className="mt-4 lg:mt-6">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <main className="mt-4 lg:mt-6">
        <div className="text-center py-20 text-gray-500">
          <p>No published quizzes found for analytics.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mt-4 lg:mt-6">
      <div className="space-y-6 lg:space-y-8">
        {/* Recent Quiz Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <h2 className="text-base font-normal">Recent Quiz</h2>
                <a href="/quizzes" className="text-sm text-black hover:underline">
                See all
                </a>
            </div>
            <button className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white px-3 py-1.5 lg:px-6 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium">
                Download {activeQuiz?.class ? `${activeQuiz.class.grade}-${activeQuiz.class.section}` : "Class"} Analytics
            </button>
          </div>

          {/* Quiz Tabs */}
          <QuizTabs tabs={tabs} activeTab={currentTab} onTabChange={setActiveTab} />
        </div>

        {/* Stats Section */}
        <QuizStats quizId={quizId} />

        {/* Main Content - Mobile: Stacked, Desktop: Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Quiz Analytics Chart */}
            <QuizAnalyticsChart quizId={quizId} quizTitle={activeQuiz?.title} />

            {/* Students List */}
            <StudentsList quizId={quizId} />
          </div>

          {/* Right Column - Questions & Insights */}
          <div className="space-y-6 lg:space-y-8">
            {/* Top Questions Missed */}
            <TopQuestionsMissed quizId={quizId} />

            {/* Insights */}
            <InsightsSection quizId={quizId} />

            {/* Recommended Actions */}
            <RecommendedActions quizId={quizId} />
          </div>
        </div>
      </div>
    </main>
  )
}
