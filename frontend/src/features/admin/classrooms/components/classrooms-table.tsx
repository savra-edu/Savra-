"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Loader2, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminClasses, AdminClass } from "@/hooks/use-admin"
import { useState } from "react"
import { getPerformanceStatus } from "@/lib/admin-constants"

interface ClassroomsTableProps {
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
}

export default function ClassroomsTable({ page = 1, limit = 10, onPageChange }: ClassroomsTableProps) {
  const router = useRouter()
  const { data: classes, isLoading, error, pagination, goToPage } = useAdminClasses(page, limit)
  const [isExporting, setIsExporting] = useState(false)

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case "above":
        return "bg-[#EEFAF4] text-[#353535]"
      case "on-track":
        return "bg-[#FFF7E6] text-[#353535]"
      case "below":
        return "bg-[#F4EAEE] text-[#353535]"
      case "critical":
        return "bg-[#FFE4E4] text-[#DC2626]"
      default:
        return "bg-gray-100 text-[#353535]"
    }
  }

  const getPerformanceLabel = (status: string) => {
    switch (status) {
      case "above":
        return "Above Target"
      case "on-track":
        return "On Track"
      case "below":
        return "Below Target"
      case "critical":
        return "Needs Attention"
      default:
        return "N/A"
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/reports/export?type=classes&format=csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'classrooms-report.csv'
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

  const handleRowClick = (classId: string) => {
    router.push(`/classrooms/${classId}`)
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
          <span className="ml-3 text-gray-600">Loading classrooms...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 w-full">
        <div className="text-center py-20">
          <p className="text-red-500 mb-2">Failed to load classrooms</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!classes || classes.length === 0) {
    return (
      <div className="mt-6 w-full">
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No classrooms found</p>
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
            All Classrooms ({pagination?.total || classes.length})
          </h1>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border w-full overflow-hidden">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#EDE8F5]">
                <TableRow className="bg-[#EDE8F5] hover:bg-[#EDE8F5]">
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Class Name</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Grade</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Section</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Students</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Teachers</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Avg. Score</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Performance</TableHead>
                  <TableHead className="font-semibold text-[#353535] h-14 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => {
                  const performanceStatus = classItem.averageScore != null
                    ? getPerformanceStatus(classItem.averageScore)
                    : null
                  return (
                    <TableRow
                      key={classItem.id}
                      className="cursor-pointer hover:bg-[#EDE8F5] transition-colors"
                      onClick={() => handleRowClick(classItem.id)}
                    >
                      <TableCell className="text-[#353535] py-6 px-6 font-medium">{classItem.name}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">Grade {classItem.grade}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{classItem.section}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{classItem.studentCount}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">{classItem.teacherCount}</TableCell>
                      <TableCell className="text-[#353535] py-6 px-6">
                        {classItem.averageScore != null ? `${classItem.averageScore.toFixed(1)}%` : "N/A"}
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        {performanceStatus ? (
                          <span
                            className={`px-4 py-2 rounded-md text-sm font-medium ${getPerformanceColor(performanceStatus)}`}
                          >
                            {getPerformanceLabel(performanceStatus)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No data</span>
                        )}
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <button
                          className="text-[#38332E] hover:text-black transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Individual class download
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} classrooms
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
