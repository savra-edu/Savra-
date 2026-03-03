"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WeeklyParticipationChartProps {
  participationRate?: number
  weeklyParticipation?: Array<{ day: string; value: number }>
}

export function WeeklyParticipationChart({ participationRate, weeklyParticipation }: WeeklyParticipationChartProps) {
  // Use real data if available
  if (!weeklyParticipation || weeklyParticipation.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-gray-500 text-sm">No participation data this week</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={weeklyParticipation} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#999" style={{ fontSize: "12px" }} />
        <YAxis domain={[0, 100]} stroke="#999" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
          formatter={(value) => [`${value}%`, "Participation"]}
        />
        <Bar dataKey="value" fill="#86efac" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
