"use client"

import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BookOpen, Download, NotebookText, TriangleAlert, Users, Loader2 } from "lucide-react"
import { useState } from "react"
import { TimePeriodTabs } from "@/features/admin/shared/components/time-period-tabs"
import { StatCard } from "@/features/admin/shared/components/stat-card"
import { AdminTeacher, TeacherInsights } from "@/hooks/use-admin"
import { ENGAGEMENT_THRESHOLDS } from "@/lib/admin-constants"

interface TeacherDetailPageProps {
  teacher: AdminTeacher
  insights: TeacherInsights | null
}

export default function TeacherDetailPage({ teacher, insights }: TeacherDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>("week")
  const [isExporting, setIsExporting] = useState(false)

  // Get subjects and grades from teacher data
  const subjects = teacher.subjects?.map(s => s.name).join(", ") || "Not assigned"
  const grades = teacher.classes?.map(c => `${c.grade}-${c.section}`).join(", ") || "Not assigned"

  // Content stats from insights
  const lessonsCount = insights?.contentStats?.lessons?.total || 0
  const quizzesCount = insights?.contentStats?.quizzes?.total || 0
  const assessmentsCount = insights?.contentStats?.assessments || 0

  // Chart data from class performance (if available)
  // Only show chart if we have real engagement data
  const hasEngagementData = insights?.studentEngagement?.averageScore !== undefined &&
    insights?.studentEngagement?.totalStudents !== undefined &&
    insights.studentEngagement.totalStudents > 0

  const chartData = hasEngagementData && teacher.classes?.length ? teacher.classes.map(c => ({
    class: `${c.grade}-${c.section}`,
    avgScore: insights.studentEngagement.averageScore,
    completion: Math.round((insights.studentEngagement.totalQuizAttempts / insights.studentEngagement.totalStudents) * 100),
  })) : []

  // Recent activities from insights
  const recentActivities = [
    ...(insights?.recentActivity?.lessons || []).slice(0, 2).map(lesson => ({
      icon: <NotebookText className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />,
      title: "Created Lesson",
      subtitle: lesson.title,
      time: new Date(lesson.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    })),
    ...(insights?.recentActivity?.quizzes || []).slice(0, 2).map(quiz => ({
      icon: <NotebookText className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />,
      title: "Quiz Conducted",
      subtitle: quiz.title,
      time: new Date(quiz.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    })),
  ].slice(0, 3)

  // Fallback activities if no data
  const displayActivities = recentActivities.length > 0 ? recentActivities : [
    {
      icon: <NotebookText className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />,
      title: "No Recent Activity",
      subtitle: "No lessons or quizzes created yet",
      time: "",
    },
  ]

  // Check for low engagement
  const hasLowEngagement = insights?.studentEngagement?.averageScore !== undefined &&
    insights.studentEngagement.averageScore < ENGAGEMENT_THRESHOLDS.LOW_SCORE_WARNING

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/reports/export?type=teacher&teacherId=${teacher.id}&format=csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${teacher.name.replace(/\s+/g, '-')}-report.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-row justify-between items-center">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-base font-normal text-[#353535]">
            Subject: <span className="font-bold">{subjects}</span>
          </h1>
          <p className="text-base font-normal text-[#353535]">
            Grade Taught: <span className="font-bold">{grades}</span>
          </p>
        </div>

        {/* Tabs Component */}
        <TimePeriodTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
        <StatCard
          label="Lessons"
          subtitle="Created"
          value={lessonsCount}
          icon={<Users className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />}
          color="bg-[#F2E8EC]"
        />
        <StatCard
          label="Quizzes"
          subtitle="Conducted"
          value={quizzesCount}
          icon={<BookOpen className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />}
          color="bg-[#E6F4E9]"
        />
        <StatCard
          label="Assessments"
          subtitle="Assigned"
          value={assessmentsCount}
          icon={<BookOpen className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />}
          color="bg-[#FCF1E0]"
        />
        <StatCard
          label={hasLowEngagement ? "Low Engagement Note" : "Student Engagement"}
          description={hasLowEngagement
            ? `Average score is ${insights?.studentEngagement?.averageScore}%. Consider reviewing teaching methods.`
            : `${insights?.studentEngagement?.totalStudents || 0} students with ${insights?.studentEngagement?.averageScore || 0}% avg score`
          }
          icon={<TriangleAlert className="w-6 h-6" strokeWidth={1.15} stroke="#BDB8BE" />}
          color={hasLowEngagement ? "bg-[#FBF0EF]" : "bg-[#E6F4E9]"}
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class-wise Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Class-wise Breakdown</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-foreground">Avg Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-sm text-foreground">Completion</span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="class" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="avgScore" fill="#6366f1" />
                <Bar dataKey="completion" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No class data available
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-[#353535] mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {displayActivities.map((activity, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F5ECF5] border border-border hover:bg-opacity-75 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    {activity.time && (
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-[#DF6647] hover:bg-[#DF6647]/90 font-semibold text-white px-6 py-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={20} />
              Export Report (CSV)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
