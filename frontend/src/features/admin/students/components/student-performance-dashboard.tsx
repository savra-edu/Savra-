"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClassAverageChart } from "./class-average-chart"
import { WeeklyParticipationChart } from "./weekly-participation-chart"
import { TopicPerformanceChart } from "./topic-performance-chart"
import { StudentAnalyticsDialog } from "./student-analytics-dialog"
import { AdminClass, ClassPerformance } from "@/hooks/use-admin"

interface StudentPerformanceDashboardProps {
  classData: AdminClass
  performance: ClassPerformance | null
}

/** Build leaderboard from students ranked by totalPoints (ties get same rank) */
function buildLeaderboard(
  students: Array<{ id: string; totalPoints?: number }>
): Map<string, { rank: number; totalInClass: number }> {
  const sorted = [...students].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
  const map = new Map<string, { rank: number; totalInClass: number }>()
  let currentRank = 0
  let lastPoints = -1
  for (let i = 0; i < sorted.length; i++) {
    const pts = sorted[i].totalPoints ?? 0
    if (pts !== lastPoints) {
      currentRank = i + 1
      lastPoints = pts
    }
    map.set(sorted[i].id, { rank: currentRank, totalInClass: sorted.length })
  }
  return map
}

export default function StudentPerformanceDashboard({ classData, performance }: StudentPerformanceDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  const leaderboard = classData.students?.length
    ? buildLeaderboard(classData.students)
    : new Map<string, { rank: number; totalInClass: number }>()

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId)
    setAnalyticsOpen(true)
  }

  const handleAnalyticsClose = (open: boolean) => {
    setAnalyticsOpen(open)
    if (!open) setSelectedStudentId(null)
  }

  const className = classData.name || `Class ${classData.grade} ${classData.section}`
  const gradeSection = `Grade ${classData.grade}${classData.section}`

  return (
    <main className="mt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-sm font-medium text-[#353535]">
          Grade: <span className="text-sm font-bold">{gradeSection}</span>
        </h1>
        <p className="text-sm text-gray-700 mt-1">
          Students: <span className="font-semibold">{performance?.studentCount || classData.studentCount} students</span>
          {" • "}
          Avg Score: <span className="font-semibold">{performance?.averageScore?.toFixed(1) || "N/A"}%</span>
          {" • "}
          Participation: <span className="font-semibold">{performance?.participationRate?.toFixed(1) || "N/A"}%</span>
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Class Average Over Time */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Class Average Over Time</CardTitle>
            <CardDescription className="text-xs">{className}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassAverageChart
              averageScore={performance?.averageScore}
              monthlyAverages={performance?.monthlyAverages}
            />
          </CardContent>
        </Card>

        {/* Weekly Participation */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Weekly Participation</CardTitle>
            <CardDescription className="text-xs">Student engagement by day</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyParticipationChart
              participationRate={performance?.participationRate}
              weeklyParticipation={performance?.weeklyParticipation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Subject Performance</CardTitle>
          <CardDescription className="text-xs">{className}</CardDescription>
        </CardHeader>
        <CardContent>
          <TopicPerformanceChart subjectBreakdown={performance?.subjectBreakdown} />
        </CardContent>
      </Card>

      {/* Students in this class */}
      {classData.students && classData.students.length > 0 && (
        <Card className="border-0 shadow-sm mt-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Students in this class</CardTitle>
            <CardDescription className="text-xs">
              {classData.students.length} student{classData.students.length !== 1 ? "s" : ""} enrolled • Click to view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {classData.students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleStudentClick(student.id)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left w-full sm:w-auto min-w-[200px] cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-blue-800">
                      {student.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#353535] truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    {student.rollNumber != null && (
                      <p className="text-xs text-gray-400">Roll: {student.rollNumber}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers and Needs Attention */}
      {performance && (
        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Top Performers */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-green-700">Top Performers</CardTitle>
              <CardDescription className="text-xs">Students with highest scores</CardDescription>
            </CardHeader>
            <CardContent>
              {performance.topPerformers && performance.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {performance.topPerformers.slice(0, 5).map((student, index) => (
                    <div key={student.studentId} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-green-700">{index + 1}</span>
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{student.average?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Needs Attention */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-amber-700">Needs Attention</CardTitle>
              <CardDescription className="text-xs">Students who may need additional support</CardDescription>
            </CardHeader>
            <CardContent>
              {performance.needsAttention && performance.needsAttention.length > 0 ? (
                <div className="space-y-3">
                  {performance.needsAttention.slice(0, 5).map((student, index) => (
                    <div key={student.studentId} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-amber-700">{index + 1}</span>
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-700">{student.average?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No students need attention</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teachers Assigned */}
      {classData.teachers && classData.teachers.length > 0 && (
        <Card className="border-0 shadow-sm mt-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Teachers Assigned</CardTitle>
            <CardDescription className="text-xs">
              {classData.teachers.length} teacher{classData.teachers.length !== 1 ? 's' : ''} assigned to this class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {classData.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-800">
                      {teacher.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{teacher.name}</p>
                    <p className="text-xs text-gray-500">{teacher.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StudentAnalyticsDialog
        studentId={selectedStudentId}
        open={analyticsOpen}
        onOpenChange={handleAnalyticsClose}
        classRank={selectedStudentId ? leaderboard.get(selectedStudentId) : undefined}
      />
    </main>
  )
}
