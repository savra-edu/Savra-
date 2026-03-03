"use client"

import { useFetch } from "@/hooks/use-api"

interface QuizStatsData {
  studentsAssessed: number
  totalStudents: number
  averageScore: number
  completionRate: number
}

interface QuizStatsProps {
  quizId: string | null
}

// Placeholder quiz stats data
const PLACEHOLDER_STATS: QuizStatsData = {
  studentsAssessed: 32,
  totalStudents: 40,
  averageScore: 82,
  completionRate: 80
}

export function QuizStats({ quizId }: QuizStatsProps) {
  const { data: statsData, isLoading } = useFetch<QuizStatsData>(
    quizId ? `/teacher/analytics/quiz/${quizId}/stats` : null
  )

  const finalStats = statsData || PLACEHOLDER_STATS

  const stats = [
    {
      label: "Students Assessed",
      value: isLoading ? "..." : `${finalStats.studentsAssessed}/${finalStats.totalStudents}`
    },
    {
      label: "Average Score",
      value: isLoading ? "..." : `${finalStats.averageScore}%`
    },
    {
      label: "Completion Rate",
      value: isLoading ? "..." : `${finalStats.completionRate}%`
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 lg:gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#FDFBFE] p-4 lg:p-6 rounded-lg border space-y-2 border-[#F0EAFA]">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl lg:text-4xl font-bold text-[#353535]">{stat.value}</div>
          )}
          <div className="text-xs lg:text-sm text-[#353535]">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
