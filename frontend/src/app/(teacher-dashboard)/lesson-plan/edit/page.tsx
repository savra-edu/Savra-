"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGeneration } from "@/contexts/generation-context"
import EditLessonDetails from "@/features/teacher/lesson-plan/components/edit-lesson-details";
import { EditLessonHeader } from "@/features/teacher/lesson-plan/components/edit-lesson-header";
import { queryKeys, useApiQuery } from "@/hooks/use-query"
import { Lesson } from "@/types/api"

function EditLessonPageContent() {
    const searchParams = useSearchParams()
    const lessonId = searchParams.get("id")
    const [isEditMode, setIsEditMode] = useState(false)
    const { activeJob } = useGeneration()

    const { data: lesson, isLoading, isFetching, error, refetch } = useApiQuery<Lesson>({
        queryKey: queryKeys.lesson(lessonId ?? "missing"),
        endpoint: `/lessons/${lessonId}`,
        enabled: !!lessonId,
    })

    const hasRenderableLessonContent = Boolean(
        lesson?.content ||
        lesson?.periods?.some((period) =>
            Boolean(
                period.concept ||
                period.learningOutcomes ||
                period.teacherLearningProcess ||
                period.assessment ||
                period.resources ||
                period.centurySkillsValueEducation ||
                period.realLifeApplication ||
                period.reflection
            )
        )
    )
    const isCurrentCompletedLessonJob =
        activeJob?.artifactType === "lesson" &&
        activeJob.artifactId === lessonId &&
        activeJob.status === "completed"
    const isAwaitingCompletedLessonContent =
        isCurrentCompletedLessonJob &&
        !hasRenderableLessonContent &&
        (isLoading || isFetching)

    if (!lessonId) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No lesson ID provided</p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading lesson...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isAwaitingCompletedLessonContent) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Opening generated lesson plan...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Error loading lesson: {error?.message || "Request failed"}</p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-[#DF6647] text-white rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <EditLessonHeader
                isEditMode={isEditMode}
                onEditClick={() => setIsEditMode(!isEditMode)}
                lessonTitle={lesson?.title}
                minimal
            />
            <div className="flex-1 min-h-0">
                <EditLessonDetails
                    isEditMode={isEditMode}
                    lesson={lesson}
                    onSave={refetch}
                />
            </div>
        </div>
    )
}

export default function EditLessonPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <EditLessonPageContent />
        </Suspense>
    )
}