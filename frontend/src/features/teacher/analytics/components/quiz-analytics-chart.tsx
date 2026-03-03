"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"
import { useFetch } from "@/hooks/use-api"

interface ScoreDistribution {
  range: string
  students: number
}

interface QuizAnalyticsChartProps {
  quizId: string | null
  quizTitle?: string
}

const colors = ["#FF6B6B", "#FFD93D", "#FFD93D", "#4ECDC4", "#6BCF7F", "#FFD93D"]

const defaultData: ScoreDistribution[] = [
  { range: "0-20%", students: 0 },
  { range: "20-40%", students: 0 },
  { range: "40-50%", students: 0 },
  { range: "50-60%", students: 0 },
  { range: "60-80%", students: 0 },
  { range: "80-100%", students: 0 },
]

// Placeholder score distribution data
const PLACEHOLDER_DISTRIBUTION: ScoreDistribution[] = [
  { range: "0-20%", students: 1 },
  { range: "20-40%", students: 2 },
  { range: "40-50%", students: 3 },
  { range: "50-60%", students: 5 },
  { range: "60-80%", students: 12 },
  { range: "80-100%", students: 18 },
]

export function QuizAnalyticsChart({ quizId, quizTitle }: QuizAnalyticsChartProps) {
  const { data: distributionData, isLoading } = useFetch<ScoreDistribution[]>(
    quizId ? `/teacher/analytics/quiz/${quizId}/score-distribution` : null
  )

  const data = (distributionData && distributionData.length > 0 && distributionData.some(d => d.students > 0))
    ? distributionData 
    : PLACEHOLDER_DISTRIBUTION
  const maxStudents = Math.max(...data.map(d => d.students), 60)
  const yAxisMax = Math.ceil(maxStudents / 20) * 20

  return (
    <div className="space-y-4">
      <h3 className="text-lg lg:text-2xl font-bold">{quizTitle || "Quiz"} Analytics</h3>
      <div className="bg-white p-4 lg:p-6 rounded-lg border">
        <div className="mb-4">
          <p className="text-sm lg:text-base font-semibold text-black">Number of Students</p>
        </div>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tick={{ fontSize: 10 }}
                ticks={[0, Math.round(yAxisMax / 3), Math.round(yAxisMax * 2 / 3), yAxisMax]}
                label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="students" position="top" fill="#000000" fontSize={10} />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
