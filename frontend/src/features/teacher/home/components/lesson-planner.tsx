"use client"

import { useMemo } from "react"
import LessonCard from "@/components/lesson-card"
import { useFetch } from "@/hooks/use-api"

interface Lesson {
    id: string
    title: string
    subject: string
    targetClass: string
    status: string
    createdAt: string
    duration?: number
}

interface Quiz {
    id: string
    title: string
    subject: string
    targetClass: string
    status: string
    createdAt: string
}

interface Assessment {
    id: string
    title: string
    subject: string
    targetClass: string
    status: string
    createdAt: string
}

// API response types
interface LessonsResponse {
    lessons: Lesson[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface QuizzesResponse {
    quizzes: Quiz[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface AssessmentsResponse {
    assessments: Assessment[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}

type ContentItem = {
    id: string
    type: "Lesson" | "Quiz" | "Assessment"
    subject: string
    status: "Saved" | "Draft" | "Published"
    date: string
    classCode: string
    duration?: string
}

export default function LessonPlanner() {
    const { data: lessonsResponse, isLoading: lessonsLoading } = useFetch<LessonsResponse>("/lessons?limit=8")
    const { data: quizzesResponse, isLoading: quizzesLoading } = useFetch<QuizzesResponse>("/quizzes?limit=8")
    const { data: assessmentsResponse, isLoading: assessmentsLoading } = useFetch<AssessmentsResponse>("/assessments?limit=8")

    // Extract arrays from response objects
    const lessons = lessonsResponse?.lessons || []
    const quizzes = quizzesResponse?.quizzes || []
    const assessments = assessmentsResponse?.assessments || []

    const isLoading = lessonsLoading || quizzesLoading || assessmentsLoading

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "2-digit" })
    }

    const mapStatus = (status: string): "Saved" | "Draft" | "Published" => {
        if (status === "draft" || status === "Draft") return "Draft"
        if (status === "published" || status === "Published") return "Published"
        return "Saved"
    }

    const contentItems = useMemo<ContentItem[]>(() => {
        const items: ContentItem[] = []

        // Add lessons
        if (lessons) {
            lessons.forEach((lesson) => {
                items.push({
                    id: `lesson-${lesson.id}`,
                    type: "Lesson",
                    subject: lesson.title || lesson.subject,
                    status: mapStatus(lesson.status),
                    date: formatDate(lesson.createdAt),
                    classCode: lesson.targetClass || "N/A",
                    duration: lesson.duration ? `${lesson.duration} Periods` : undefined
                })
            })
        }

        // Add quizzes
        if (quizzes) {
            quizzes.forEach((quiz) => {
                items.push({
                    id: `quiz-${quiz.id}`,
                    type: "Quiz",
                    subject: quiz.title || quiz.subject,
                    status: mapStatus(quiz.status),
                    date: formatDate(quiz.createdAt),
                    classCode: quiz.targetClass || "N/A"
                })
            })
        }

        // Add assessments
        if (assessments) {
            assessments.forEach((assessment) => {
                items.push({
                    id: `assessment-${assessment.id}`,
                    type: "Assessment" as "Lesson", // Display as Lesson type for the card
                    subject: assessment.title || assessment.subject,
                    status: mapStatus(assessment.status),
                    date: formatDate(assessment.createdAt),
                    classCode: assessment.targetClass || "N/A"
                })
            })
        }

        // Sort by date (newest first)
        items.sort((a, b) => {
            const dateA = new Date(a.date.split("/").reverse().join("-"))
            const dateB = new Date(b.date.split("/").reverse().join("-"))
            return dateB.getTime() - dateA.getTime()
        })

        return items.slice(0, 16) // Limit to 16 items
    }, [lessons, quizzes, assessments, formatDate, mapStatus])

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-base font-semibold text-[#353535]">Recent Activity</h2>
                <a href="/history" className="text-[#353535] text-sm font-medium">
                    Sort by: All
                </a>
            </div>
            <main className="flex-1 min-h-0 flex flex-col bg-[#FCFCFC] border border-[#DCDCDC] rounded-3xl overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-10 h-10 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && contentItems.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>No recent activity</p>
                        </div>
                    )}

                    {/* Content */}
                    {!isLoading && contentItems.length > 0 && (
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-4 gap-2">
                                {contentItems.map((lesson) => (
                                    <LessonCard
                                        key={lesson.id}
                                        id={lesson.id}
                                        type={lesson.type === "Assessment" ? "Lesson" : lesson.type}
                                        subject={lesson.subject}
                                        status={lesson.status}
                                        date={lesson.date}
                                        duration={lesson.duration}
                                        classCode={lesson.classCode}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
