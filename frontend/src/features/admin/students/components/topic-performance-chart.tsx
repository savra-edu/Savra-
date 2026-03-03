"use client"

import { getPerformanceStatus, PERFORMANCE_LABELS } from "@/lib/admin-constants"

interface SubjectBreakdown {
  subjectId: string
  subjectName: string
  averageScore: number
}

interface TopicPerformanceChartProps {
  subjectBreakdown?: SubjectBreakdown[]
}

const statusColors = {
  above: "bg-green-300",
  "on-track": "bg-yellow-300",
  below: "bg-pink-300",
  critical: "bg-red-400",
}

export function TopicPerformanceChart({ subjectBreakdown }: TopicPerformanceChartProps) {
  // Show empty state if no real data
  if (!subjectBreakdown || subjectBreakdown.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 text-sm">No subject performance data available yet</p>
      </div>
    )
  }

  const topics = subjectBreakdown.map(subject => ({
    name: subject.subjectName,
    percentage: Math.round(subject.averageScore),
    status: getPerformanceStatus(subject.averageScore),
  }))

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex gap-6 text-xs mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <span className="text-gray-700">{PERFORMANCE_LABELS.above}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-300 rounded-sm"></div>
          <span className="text-gray-700">{PERFORMANCE_LABELS["on-track"]}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-300 rounded-sm"></div>
          <span className="text-gray-700">{PERFORMANCE_LABELS.below}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
          <span className="text-gray-700">{PERFORMANCE_LABELS.critical}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.name} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium text-gray-900 truncate">{topic.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full ${statusColors[topic.status as keyof typeof statusColors]} rounded-full transition-all duration-300`}
                style={{ width: `${topic.percentage}%` }}
              ></div>
            </div>
            <div className="w-12 text-right text-sm font-semibold text-gray-900">{topic.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
