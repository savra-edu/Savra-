"use client"

import { useRouter } from "next/navigation"
import { Download, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminClasses, AdminClass } from "@/hooks/use-admin"
import { useState } from "react"

// Color palette for cards - rotates through these colors
const cardColors = [
    "bg-[#E8DFD0]", // tan/beige
    "bg-[#D4E8D4]", // light green
    "bg-[#E8E8E8]", // light gray
    "bg-[#D4E8D4]", // light green
    "bg-[#E8DFD0]", // tan/beige
]

interface ClassroomsGridProps {
    selectedGrade?: string
}

export default function ClassroomsGrid({ selectedGrade }: ClassroomsGridProps) {
    const router = useRouter()
    const gradeFilter = selectedGrade && selectedGrade !== "all" ? parseInt(selectedGrade) : undefined
    const { data: classes, isLoading, error } = useAdminClasses(1, 50, gradeFilter)
    const [isExporting, setIsExporting] = useState(false)

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
            a.download = 'classrooms-report.pdf'
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

    const handleCardClick = (classId: string) => {
        router.push(`/students/${classId}`)
    }

    // Group classes by grade
    const groupedClasses = classes?.reduce((acc, cls) => {
        const gradeKey = `Grade ${cls.grade}`
        if (!acc[gradeKey]) {
            acc[gradeKey] = []
        }
        acc[gradeKey].push(cls)
        return acc
    }, {} as Record<string, AdminClass[]>) || {}

    // Sort grades (highest first)
    const sortedGrades = Object.keys(groupedClasses).sort((a, b) => {
        const gradeA = parseInt(a.replace('Grade ', ''))
        const gradeB = parseInt(b.replace('Grade ', ''))
        return gradeB - gradeA
    })

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
                    <p className="text-gray-500">No classrooms found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-6 w-full relative min-h-[calc(100vh-250px)]">
            {/* All Classes Label */}
            <div className="mb-4">
                <span className="text-sm text-gray-500 font-medium">All</span>
            </div>

            {/* Classes Grid - grouped by grade */}
            <div className="space-y-8">
                {sortedGrades.map((gradeLabel) => (
                    <div key={gradeLabel} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {groupedClasses[gradeLabel].map((classItem, index) => {
                            const colorClass = cardColors[index % cardColors.length]
                            // Mock trend data - in real app this would come from API
                            const trend = classItem.averageScore && classItem.averageScore > 50
                                ? Math.floor(Math.random() * 10) + 1
                                : -(Math.floor(Math.random() * 5) + 1)
                            const isPositive = trend > 0

                            return (
                                <div
                                    key={classItem.id}
                                    onClick={() => handleCardClick(classItem.id)}
                                    className={`${colorClass} rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow`}
                                >
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-[#353535] text-lg">
                                                {classItem.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {classItem.studentCount} students
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <div className="text-3xl font-bold text-[#353535]">
                                                {classItem.averageScore != null ? `${Math.round(classItem.averageScore)}%` : "N/A"}
                                            </div>
                                            <p className="text-sm text-gray-500">Avg</p>
                                        </div>

                                        <div className="flex items-center gap-1 pt-1">
                                            {isPositive ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                                {isPositive ? '+' : ''}{trend}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Export Button - Fixed at bottom right */}
            <div className="fixed bottom-8 right-8">
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold px-6 py-6 rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={20} />
                            Export Report (PDF)
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
