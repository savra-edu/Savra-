"use client"
import React, { useState } from "react"
import Image from "next/image"
import { QuizChart } from "@/components/quiz-chart"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/use-api"

interface AnalyticsOverview {
  totalQuizzes: number
  totalStudentsAssessed: number
  averageCompletionRate: number
  overallAverageScore: number
}

interface ClassInsight {
  grade: string
  insights: string[]
}

// Fallback grades in case API fails
const FALLBACK_GRADES = ["7th", "8th", "9th", "10th", "11th", "12th"]

// Placeholder/dummy data for analytics
const PLACEHOLDER_OVERVIEW: AnalyticsOverview = {
  totalQuizzes: 24,
  totalStudentsAssessed: 142,
  averageCompletionRate: 87,
  overallAverageScore: 78
}

const PLACEHOLDER_INSIGHTS: Record<string, string[]> = {
  "7th": [
    "Overall performance is improving steadily",
    "Most students struggle with algebraic expressions",
    "Geometry concepts need more practice sessions"
  ],
  "8th": [
    "Class average increased by 5% this month",
    "Fractions and decimals need reinforcement",
    "Top performers show strong conceptual understanding"
  ],
  "9th": [
    "Students are performing well in basic concepts",
    "Advanced topics require additional support",
    "Completion rate has improved significantly"
  ],
  "10th": [
    "Strong performance in problem-solving questions",
    "Time management skills have improved",
    "Regular practice is showing positive results"
  ],
  "11th": [
    "High engagement with complex problems",
    "Most students have completed assigned quizzes",
    "Performance trends are consistently upward"
  ],
  "12th": [
    "Excellent preparation for final exams",
    "Students demonstrate mastery of core concepts",
    "Review sessions have been highly effective"
  ]
}

export default function QuizDashboard() {
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState("8th")

  const { data: overview, isLoading } = useFetch<AnalyticsOverview>("/teacher/analytics/overview")
  const { data: gradesData } = useFetch<string[]>("/teacher/grades")
  const { data: classInsights } = useFetch<ClassInsight>(`/teacher/analytics/class-insights?grade=${selectedGrade}`)

  const gradeOptions = gradesData || FALLBACK_GRADES

  // Use placeholder data if API fails or returns no data
  const stats = {
    totalQuizzes: overview?.totalQuizzes ?? PLACEHOLDER_OVERVIEW.totalQuizzes,
    totalStudents: overview?.totalStudentsAssessed ?? PLACEHOLDER_OVERVIEW.totalStudentsAssessed,
    completionRate: overview?.averageCompletionRate ?? PLACEHOLDER_OVERVIEW.averageCompletionRate,
    averageScore: overview?.overallAverageScore ?? PLACEHOLDER_OVERVIEW.overallAverageScore
  }

  const insights = classInsights?.insights || PLACEHOLDER_INSIGHTS[selectedGrade] || []

  return (
    <main className="mt-6">

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Stat Card 1 */}
          <div className="bg-[#FCF8FE] rounded-2xl p-4 lg:p-8 text-center border border-[#F0EAFA]">
            <div className="hidden lg:flex justify-center mb-4">
                <Image src="/images/quiz.png" alt="Quiz" width={200} height={200} />
            </div>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mx-auto"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-bold text-[#353535]">{stats.totalQuizzes}</h3>
            )}
            <p className="text-gray-700 mt-2 font-medium text-sm lg:text-base">Total Quizzes Conducted</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-[#FCF8FE] rounded-2xl p-4 lg:p-8 text-center border border-[#F0EAFA]">
            <div className="hidden lg:flex justify-center mb-4">
              <Image src="/images/assessed.png" alt="Assessed" width={200} height={200} />
            </div>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mx-auto"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-bold text-[#353535]">{stats.totalStudents}</h3>
            )}
            <p className="text-gray-700 mt-2 font-medium text-sm lg:text-base">Total Students Assessed</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-[#FCF8FE] rounded-2xl p-4 lg:p-8 text-center border border-[#F0EAFA]">
            <div className="hidden lg:flex justify-center mb-4">
                <Image src="/images/complete.png" alt="Completion" width={200} height={200} />
            </div>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mx-auto"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-bold text-[#353535]">{stats.completionRate}%</h3>
            )}
            <p className="text-gray-700 mt-2 font-medium text-sm lg:text-base">Average Completion Rate</p>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-[#FCF8FE] rounded-2xl p-4 lg:p-8 text-center border border-[#F0EAFA]">
            <div className="hidden lg:flex justify-center mb-4">
                <Image src="/images/score.png" alt="Score" width={200} height={200} />
            </div>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mx-auto"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-bold text-[#353535]">{stats.averageScore}%</h3>
            )}
            <p className="text-gray-700 mt-2 font-medium text-sm lg:text-base">Overall Average Score</p>
          </div>
        </div>
      </section>

      {/* Class Wise Performance Section */}
      <section className="mt-6 lg:px-6 lg:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Chart */}
          <div className="lg:col-span-2">
            <h2 className="text-xl lg:text-3xl font-bold text-[#353535] mb-4 lg:mb-8">Class wise Quiz Performance</h2>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4 lg:mb-8">
                <p className="text-black font-semibold text-base">Average Score</p>

                {/* Tabs */}
                <div className="flex gap-2 lg:gap-4">
                {gradeOptions.map((grade) => (
                    <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${
                        grade === selectedGrade ? "bg-gray-200 text-gray-900" : "text-gray-400 hover:text-gray-600"
                    }`}
                    >
                    {grade}
                    </button>
                ))}
                </div>
            </div>

            {/* Chart */}
            <QuizChart grade={selectedGrade} />
          </div>

          {/* Insights */}
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="bg-[#FCF8FE] rounded-2xl p-6 lg:p-8 text-left border border-[#F0EAFA]">
              <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Insights of Class {selectedGrade} quiz performance</h3>
              {insights.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No insights available yet. Complete more quizzes to generate insights.</p>
              ) : (
                <ul className="space-y-4 lg:space-y-6">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700 text-sm lg:text-base">{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              onClick={() =>  router.push("/analytics/quiz")}
              className="w-full lg:w-auto bg-[#DF6647] hover:bg-[#DF6647]/90 text-white px-6 py-4 rounded-lg font-semibold"
            >
              Quiz Analytics
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
