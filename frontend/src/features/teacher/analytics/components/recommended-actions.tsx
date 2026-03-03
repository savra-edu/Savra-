"use client"

import { useFetch } from "@/hooks/use-api"

interface RecommendationsData {
  recommendations: string[]
}

interface RecommendedActionsProps {
  quizId: string | null
}

// Placeholder recommendations data
const PLACEHOLDER_RECOMMENDATIONS: string[] = [
  "Conduct a review session for questions with >40% incorrect rate",
  "Provide additional practice worksheets for fraction operations",
  "Schedule one-on-one sessions with students scoring below 70%",
  "Create follow-up quiz focusing on commonly missed concepts"
]

export function RecommendedActions({ quizId }: RecommendedActionsProps) {
  const { data: recommendationsData, isLoading } = useFetch<RecommendationsData>(
    quizId ? `/teacher/analytics/quiz/${quizId}/recommendations` : null
  )

  const actions = (recommendationsData?.recommendations && recommendationsData.recommendations.length > 0)
    ? recommendationsData.recommendations 
    : PLACEHOLDER_RECOMMENDATIONS

  return (
    <div className="space-y-4 bg-[#FEFBFE] rounded-lg p-4 lg:p-6 border border-[#F0EAFA]">
      <div className="flex items-center gap-2">
        <span className="text-xl">📋</span>
        <h3 className="font-bold text-base lg:text-lg">Recommended Actions</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && actions.length === 0 && (
        <p className="text-sm text-gray-500">No recommendations available yet</p>
      )}

      {!isLoading && actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((action, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <p className="text-sm lg:text-base text-gray-700">{action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
