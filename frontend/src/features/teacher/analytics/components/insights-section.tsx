"use client"

import { useFetch } from "@/hooks/use-api"

interface InsightsData {
  insights: string[]
}

interface InsightsSectionProps {
  quizId: string | null
}

// Placeholder insights data
const PLACEHOLDER_INSIGHTS: string[] = [
  "Students performed exceptionally well in basic arithmetic questions",
  "Advanced problem-solving questions need more practice sessions",
  "Time management has improved significantly compared to last quiz",
  "Top 3 students scored above 90%, showing strong conceptual understanding"
]

export function InsightsSection({ quizId }: InsightsSectionProps) {
  const { data: insightsData, isLoading } = useFetch<InsightsData>(
    quizId ? `/teacher/analytics/quiz/${quizId}/insights` : null
  )

  const insights = (insightsData?.insights && insightsData.insights.length > 0) 
    ? insightsData.insights 
    : PLACEHOLDER_INSIGHTS

  return (
    <div className="space-y-4 bg-[#FEFBFE] rounded-lg p-4 lg:p-6 border border-[#F0EAFA]">
      <div className="flex items-center gap-2">
        <span className="text-xl">💡</span>
        <h3 className="font-bold text-base lg:text-lg">Insights</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && insights.length === 0 && (
        <p className="text-sm text-gray-500">No insights available yet</p>
      )}

      {!isLoading && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <p className="text-sm lg:text-base text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
