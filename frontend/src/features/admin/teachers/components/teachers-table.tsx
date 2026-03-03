"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminTeachers, AdminTeacher } from "@/hooks/use-admin"
import { api } from "@/lib/api"
import { useState } from "react"
import { getActivityLevel } from "@/lib/admin-constants"

interface TeachersTableProps {
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
}

export default function DashboardTable({ page = 1, limit = 10, onPageChange }: TeachersTableProps) {
  const router = useRouter()
  const { data: teachers, isLoading, error, pagination, nextPage, prevPage, goToPage } = useAdminTeachers(page, limit)
  const [isExporting, setIsExporting] = useState(false)

  // Calculate teacher activity level using centralized constants
  const getTeacherActivityLevel = (teacher: AdminTeacher): 'High' | 'Mid' | 'Low' => {
    const total = (teacher.lessonCount || 0) + (teacher.quizCount || 0) + (teacher.assessmentCount || 0)
    return getActivityLevel(total)
  }

  // Get unique grades from teacher's classes
  const getGrades = (teacher: AdminTeacher): string => {
    const grades = [...new Set(teacher.classes?.map(c => c.grade) || [])]
    return grades.length > 0 ? `Grade ${grades.sort((a, b) => a - b).join(", ")}` : "None"
  }

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "High":
        return "bg-[#EEFAF4] text-[#353535]"
      case "Low":
        return "bg-[#F4EAEE] text-[#353535]"
      case "Mid":
        return "bg-[#FFF7E6] text-[#353535]"
      default:
        return ""
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/reports/export?type=teachers&format=csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'teachers-report.csv'
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

  const handleRowClick = (teacherId: string) => {
    router.push(`/teachers/${teacherId}`)
  }

  const handlePageChange = (newPage: number) => {
    goToPage(newPage)
    onPageChange?.(newPage)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-6 w-full">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
          <span className="ml-3 text-gray-600">Loading teachers...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 w-full">
        <div className="text-center py-20">
          <p className="text-red-500 mb-2">Failed to load teachers</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!teachers || teachers.length === 0) {
    return (
      <div className="mt-6 w-full">
        <div className="text-center py-20">
          <p className="text-gray-500">No teachers found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 w-full">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#353535]">
            All Teachers ({pagination?.total || teachers.length})
          </h1>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border w-full overflow-hidden">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#EDE8F5]">
                <TableRow className="bg-[#EDE8F5] hover:bg-[#EDE8F5]">
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Teachers name</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Subject</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Grade</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Lessons</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Quizzes</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Assessments</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Activity</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => {
                  const activity = getTeacherActivityLevel(teacher)
                  return (
                    <TableRow
                      key={teacher.id}
                      className="cursor-pointer hover:bg-[#EDE8F5] transition-colors"
                      onClick={() => handleRowClick(teacher.id)}
                    >
                      <TableCell className="text-[#353535] py-6 px-6">{teacher.name}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">
                        {teacher.subjects?.map(s => s.name).join(", ") || "None"}
                      </TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">
                        {getGrades(teacher)}
                      </TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{teacher.lessonCount || 0}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{teacher.quizCount || 0}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{teacher.assessmentCount || 0}</TableCell>
                      <TableCell className="py-6 px-6">
                        <span
                          className={`px-4 py-2 rounded-md text-sm font-medium ${getActivityColor(activity)}`}
                        >
                          {activity}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <button
                          className="text-[#38332E] hover:text-black transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Individual teacher download
                          }}
                        >
                          <Download size={18} />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} teachers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="flex justify-end pt-8">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold px-6 py-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
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
    </div>
  )
}
