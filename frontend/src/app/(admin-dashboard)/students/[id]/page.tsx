"use client"

import { use } from "react"
import StudentPerformanceDashboard from "@/features/admin/students/components/student-performance-dashboard"
import StudentPerformanceHeader from "@/features/admin/students/components/student-performance-header"
import { useAdminClass, useClassPerformance } from "@/hooks/use-admin"
import { Loader2 } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function AdminClassDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const { data: classData, isLoading: classLoading, error: classError } = useAdminClass(id)
    const { data: performance, isLoading: perfLoading, error: perfError } = useClassPerformance(id)

    const isLoading = classLoading || perfLoading
    const error = classError || perfError

    if (isLoading) {
        return (
            <div className="flex flex-col w-full p-8">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
                    <span className="ml-3 text-gray-600">Loading class data...</span>
                </div>
            </div>
        )
    }

    if (error || !classData) {
        return (
            <div className="flex flex-col w-full p-8">
                <div className="text-center py-20">
                    <p className="text-red-500 mb-2">Failed to load class</p>
                    <p className="text-gray-500 text-sm">{error || "Class not found"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full p-8">
            <StudentPerformanceHeader classData={classData} />
            <StudentPerformanceDashboard classData={classData} performance={performance} />
        </div>
    )
}
