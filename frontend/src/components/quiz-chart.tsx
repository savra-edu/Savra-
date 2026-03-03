"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { useFetch } from "@/hooks/use-api"

interface BarData {
  name: string
  score: number
}

interface ClassPerformanceResponse {
  performance: BarData[]
}

interface QuizChartProps {
  grade?: string
}

const colors = ["#FFC0B3", "#B3D7FF", "#B3D7FF", "#FFE3B3", "#B3D7FF", "#FFC0B3", "#FFE3B3"]

const defaultData: BarData[] = [
  { name: "A", score: 0 },
  { name: "B", score: 0 },
  { name: "C", score: 0 },
  { name: "D", score: 0 },
  { name: "E", score: 0 },
]

// Placeholder data for class performance
const PLACEHOLDER_DATA: BarData[] = [
  { name: "A", score: 85 },
  { name: "B", score: 78 },
  { name: "C", score: 82 },
  { name: "D", score: 75 },
  { name: "E", score: 80 },
]

export function QuizChart({ grade }: QuizChartProps) {
  const { data: response, isLoading } = useFetch<ClassPerformanceResponse>(
    grade ? `/teacher/analytics/class-performance?grade=${grade}` : null
  )

  const chartData = response?.performance && response.performance.length > 0 
    ? response.performance 
    : PLACEHOLDER_DATA

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <p>No performance data available for this grade</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis ticks={[0, 25, 50, 100]} tick={{ fill: "#D1D5DB", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Bar dataKey="score" fill="#8BB3E8" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
