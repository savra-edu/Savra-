"use client"

import { use } from "react"
import TeacherInsightHeader from "@/features/admin/teachers/components/teacher-insight-header"
import TeacherDetailPage from "@/features/admin/teachers/components/teacher-insights"
import { useAdminTeacher, useTeacherInsights } from "@/hooks/use-admin"
import { Loader2 } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function AdminTeacherDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const { data: teacher, isLoading: teacherLoading, error: teacherError } = useAdminTeacher(id)
    const { data: insights, isLoading: insightsLoading, error: insightsError } = useTeacherInsights(id)

    const isLoading = teacherLoading || insightsLoading
    const error = teacherError || insightsError

    if (isLoading) {
        return (
            <div className="flex flex-col w-full p-8">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DF6647]" />
                    <span className="ml-3 text-gray-600">Loading teacher details...</span>
                </div>
            </div>
        )
    }

    if (error || !teacher) {
        return (
            <div className="flex flex-col w-full p-8">
                <div className="text-center py-20">
                    <p className="text-red-500 mb-2">Failed to load teacher</p>
                    <p className="text-gray-500 text-sm">{error || "Teacher not found"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full p-8">
            <TeacherInsightHeader teacher={teacher} />
            <TeacherDetailPage teacher={teacher} insights={insights} />
        </div>
    )
}
