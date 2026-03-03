"use client"

import { useState } from "react"
import { Users, BookOpen, Award, TrendingUpIcon, TriangleAlert, GraduationCap, School, Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/features/admin/shared/components/metric-card"
import { TimePeriodTabs } from "@/features/admin/shared/components/time-period-tabs"
import { useAdminDashboard, useAdminActivityData } from "@/hooks/use-admin"
import { CLASS_SIZE_THRESHOLDS } from "@/lib/admin-constants"

export default function InsightsDashboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>("week")
  const { data: stats, isLoading, error } = useAdminDashboard()
  const { data: activityData, isLoading: activityLoading } = useAdminActivityData(activeTab)

  // Generate insights from API data
  const generateInsights = () => {
    if (!stats) return []

    const insights = []

    // Find top teacher by workload
    if (stats.teacherWorkload && stats.teacherWorkload.length > 0) {
      const topTeacher = stats.teacherWorkload.reduce((prev, current) =>
        (prev.classCount + prev.subjectCount) > (current.classCount + current.subjectCount) ? prev : current
      )
      insights.push({
        id: 1,
        icon: <Award className="w-6 h-6" strokeWidth={1.15} stroke="#353535" />,
        title: `${topTeacher.name} has the highest workload with ${topTeacher.classCount} classes and ${topTeacher.subjectCount} subjects`,
        color: "bg-[#F5ECF5]",
      })
    }

    // Find class with most students
    if (stats.studentsPerClass && stats.studentsPerClass.length > 0) {
      const topClass = stats.studentsPerClass.reduce((prev, current) =>
        prev.studentCount > current.studentCount ? prev : current
      )
      insights.push({
        id: 2,
        icon: <TrendingUpIcon className="w-6 h-6" strokeWidth={1.15} stroke="#353535" />,
        title: `${topClass.name} has the most students with ${topClass.studentCount} enrolled`,
        color: "bg-[#EEFAF4]",
      })
    }

    // Find class with fewest students (needs attention)
    if (stats.studentsPerClass && stats.studentsPerClass.length > 0) {
      const lowClass = stats.studentsPerClass.reduce((prev, current) =>
        prev.studentCount < current.studentCount ? prev : current
      )
      if (lowClass.studentCount < CLASS_SIZE_THRESHOLDS.LOW_ENROLLMENT_WARNING) {
        insights.push({
          id: 3,
          icon: <TriangleAlert className="w-6 h-6" strokeWidth={1.15} stroke="#353535" />,
          title: `${lowClass.name} has only ${lowClass.studentCount} students - consider reviewing enrollment`,
          color: "bg-[#FFF7E6]",
        })
      }
    }

    return insights.length > 0 ? insights : [
      {
        id: 1,
        icon: <Award className="w-6 h-6" strokeWidth={1.15} stroke="#353535" />,
        title: `You have ${stats.totalTeachers} active teachers across ${stats.totalClasses} classes`,
        color: "bg-[#F5ECF5]",
      },
      {
        id: 2,
        icon: <TrendingUpIcon className="w-6 h-6" strokeWidth={1.15} stroke="#353535" />,
        title: `${stats.totalStudents} students are currently enrolled in your school`,
        color: "bg-[#EEFAF4]",
      },
    ]
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-red-500 mb-2">Failed to load dashboard data</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const insights = generateInsights()

  return (
    <div className="mt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Insights</h1>

          <TimePeriodTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            label="Active Teachers"
            value={stats?.totalTeachers || 0}
            icon={<Users className="w-6 h-6" />}
            color="bg-[#F2E8EC]"
          />
          <MetricCard
            label="Lessons Created"
            value={stats?.totalLessons || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-[#E6F4E9]"
          />
          <MetricCard
            label="Assessments Made"
            value={stats?.totalAssessments || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-[#FBF0EF]"
          />
          <MetricCard
            label="Quizzes Conducted"
            value={stats?.totalQuizzes || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-[#FCF1E0]"
          />
          <MetricCard
            label="Submission Rate"
            value={`${stats?.submissionRate || 0}%`}
            icon={<Award className="w-6 h-6" />}
            color="bg-[#F3E8EC]"
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{activeTab === 'week' ? 'Weekly' : activeTab === 'month' ? 'Monthly' : 'Yearly'} Activity</CardTitle>
              <CardDescription>Content creation trends</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {activityLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#DF6647]" />
                  <span className="ml-2 text-gray-500">Loading activity data...</span>
                </div>
              ) : !activityData || activityData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">No activity data available for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="lessons"
                      stroke="#c084fc"
                      fill="#c084fc"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ fill: "#c084fc", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="quizzes"
                      stroke="#86efac"
                      fill="#86efac"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ fill: "#86efac", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="assessments"
                      stroke="#fca5a5"
                      fill="#fca5a5"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ fill: "#fca5a5", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-medium text-[#353535]">AI Pulse Summary</CardTitle>
              <CardDescription className="text-sm font-normal text-[#353535]">Real time insights from your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {insights.map((insight) => (
                <div key={insight.id} className={`${insight.color} p-3 rounded-lg flex gap-3 text-sm`}>
                  <span className="text-lg flex-shrink-0">{insight.icon}</span>
                  <p className="text-[#353535] leading-tight">{insight.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
