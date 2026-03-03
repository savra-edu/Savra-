"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ClassAverageChartProps {
  averageScore?: number
  monthlyAverages?: Array<{ month: string; value: number }>
}

export function ClassAverageChart({ averageScore, monthlyAverages }: ClassAverageChartProps) {
  // Use real data if available
  if (!monthlyAverages || monthlyAverages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-gray-500 text-sm">No historical data available yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={monthlyAverages} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#999" style={{ fontSize: "12px" }} />
        <YAxis domain={[0, 100]} stroke="#999" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
          formatter={(value) => [`${value}%`, "Score"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#a855a8"
          dot={{ fill: "#a855a8", r: 4 }}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
