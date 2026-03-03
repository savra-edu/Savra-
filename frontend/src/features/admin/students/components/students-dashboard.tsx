"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useAdminClasses } from "@/hooks/use-admin"

// Color palette for different grade levels
const getGradeColor = (grade: number): string => {
  if (grade >= 10) return "bg-[#E6F4E9]"
  if (grade >= 8) return "bg-[#FBF0EF]"
  if (grade >= 6) return "bg-[#FCF1E0]"
  return "bg-[#F2E8EC]"
}

export default function StudentsDashboard() {
  const { data: classes, isLoading, error, pagination } = useAdminClasses(1, 50)

  // Loading state
  if (isLoading) {
    return (
      <main className="mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
            <span className="ml-3 text-gray-600">Loading classes...</span>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-red-500 mb-2">Failed to load classes</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  // Empty state
  if (!classes || classes.length === 0) {
    return (
      <main className="mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-gray-500">No classes found</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-lg text-[#353535] mb-8">
          All Classes ({pagination?.total || classes.length})
        </h1>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {classes.map((classItem) => (
            <Link key={classItem.id} href={`/students/${classItem.id}`}>
              <Card className={`${getGradeColor(classItem.grade)} border-none p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="space-y-4">
                  {/* Class Name */}
                  <div>
                    <h3 className="text-sm font-medium text-[#353535]">
                      {classItem.name || `Class ${classItem.grade} ${classItem.section}`}
                    </h3>
                    <p className="text-xs text-[#353535]">{classItem.studentCount} students</p>
                  </div>

                  {/* Average Score as main metric */}
                  <div>
                    <p className="text-3xl font-bold text-[#353535]">
                      {classItem.averageScore?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-[#353535]">Avg Score</p>
                  </div>

                  {/* Teacher count info */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#353535]">
                      {classItem.teacherCount} {classItem.teacherCount === 1 ? 'teacher' : 'teachers'}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
