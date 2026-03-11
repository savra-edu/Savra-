"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
  gradeFilter?: string
  subjectFilter?: string
}

/** Check if teacher matches grade filter (supports whole grade "7", section "7-C", or multi "7-A,7-B") */
function teacherMatchesGrade(teacher: AdminTeacher, gradeFilter: string): boolean {
  if (!gradeFilter || gradeFilter === "all") return true
  const classes = teacher.classes || []
  if (classes.length === 0) return false

  // Whole grade (e.g. "7" or "8")
  if (!gradeFilter.includes("-") && !gradeFilter.includes(",")) {
    const gradeNum = parseInt(gradeFilter)
    return classes.some((c) => c.grade === gradeNum)
  }

  // Single section or multi-section (e.g. "7-C" or "7-A,7-B")
  const sections = gradeFilter.split(",").map((s) => s.trim())
  return sections.some((sec) => {
    const [g, s] = sec.split("-")
    const gradeNum = parseInt(g)
    return classes.some((c) => c.grade === gradeNum && c.section === s)
  })
}

/** Check if teacher matches subject filter */
function teacherMatchesSubject(teacher: AdminTeacher, subjectFilter: string): boolean {
  if (!subjectFilter || subjectFilter === "All Subjects") return true
  const subjects = teacher.subjects?.map((s) => s.name) || []
  return subjects.some((s) => s.toLowerCase().includes(subjectFilter.toLowerCase()))
}

export default function DashboardTable({
  page = 1,
  limit = 10,
  onPageChange,
  gradeFilter = "all",
  subjectFilter = "All Subjects",
}: TeachersTableProps) {
  const router = useRouter()
  const hasFilters = gradeFilter !== "all" || subjectFilter !== "All Subjects"
  const fetchLimit = hasFilters ? 200 : limit
  const fetchPage = hasFilters ? 1 : page
  const { data: teachers, isLoading, error, pagination, nextPage, prevPage, goToPage } = useAdminTeachers(fetchPage, fetchLimit)
  const [isExporting, setIsExporting] = useState(false)
  const [localPage, setLocalPage] = useState(1)

  useEffect(() => {
    setLocalPage(1)
  }, [gradeFilter, subjectFilter])

  const filteredTeachers = (teachers || []).filter(
    (t) => teacherMatchesGrade(t, gradeFilter) && teacherMatchesSubject(t, subjectFilter)
  )
  const totalFiltered = filteredTeachers.length
  const totalPagesFiltered = Math.ceil(totalFiltered / limit) || 1
  const displayTeachers = hasFilters
    ? filteredTeachers.slice((localPage - 1) * limit, localPage * limit)
    : (teachers || [])
  const displayPagination = hasFilters
    ? { page: localPage, limit, total: totalFiltered, totalPages: totalPagesFiltered }
    : (pagination || { page, limit, total: (teachers || []).length, totalPages: 1 })

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

  // Empty state (no teachers at all)
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
            All Teachers ({displayPagination?.total ?? displayTeachers.length})
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
                {displayTeachers.map((teacher) => {
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
        {displayPagination && displayPagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((displayPagination.page - 1) * displayPagination.limit) + 1} to {Math.min(displayPagination.page * displayPagination.limit, displayPagination.total)} of {displayPagination.total} teachers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = displayPagination.page - 1
                  hasFilters ? setLocalPage(newPage) : handlePageChange(newPage)
                }}
                disabled={displayPagination.page === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {displayPagination.page} of {displayPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = displayPagination.page + 1
                  hasFilters ? setLocalPage(newPage) : handlePageChange(newPage)
                }}
                disabled={displayPagination.page === displayPagination.totalPages}
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
