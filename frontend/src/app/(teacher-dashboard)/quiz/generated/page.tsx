"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useGeneration } from "@/contexts/generation-context"
import { GeneratedHeader } from "@/features/teacher/quiz/components/generated-header"
import GeneratedQuiz from "@/features/teacher/quiz/components/generated-quiz"
import { queryKeys, useApiQuery } from "@/hooks/use-query"

interface QuestionOption {
    id: string
    optionLabel: string
    optionText: string
    isCorrect: boolean
}

interface Question {
    id: string
    questionText: string
    questionType: string
    marks: number
    orderIndex: number
    options?: QuestionOption[]
}

interface QuestionsResponse {
    quizId: string
    totalQuestions: number
    questions: Question[]
}

interface Quiz {
    id: string
    title: string
    totalQuestions: number
    totalMarks: number
    difficultyLevel: string
    timeLimit: number
    objective?: string
    status: string
    chapters?: Array<{ id: string; name: string }>
    subject?: { id: string; name: string }
    class?: { id: string; name: string; grade: number; section: string }
}

// Transform backend question format to component format
interface TransformedQuestion {
    id: string
    text: string
    options: string[]
    correctAnswer: string
    type: "multiple_choice" | "true_false"
}

function GeneratedQuizPageContent() {
    const searchParams = useSearchParams()
    const quizId = searchParams.get("id")
    const { activeJob } = useGeneration()

    // Fetch quiz info
    const quizQuery = useApiQuery<Quiz>({
        queryKey: queryKeys.quiz(quizId ?? "missing"),
        endpoint: `/quizzes/${quizId}`,
        enabled: !!quizId,
    })

    // Fetch questions separately
    const questionsQuery = useApiQuery<QuestionsResponse>({
        queryKey: queryKeys.quizQuestions(quizId ?? "missing"),
        endpoint: `/quizzes/${quizId}/questions`,
        enabled: !!quizId,
    })

    const { data: quiz, isLoading: quizLoading, isFetching: quizFetching } = quizQuery
    const { data: questionsData, isLoading: questionsLoading, isFetching: questionsFetching } = questionsQuery

    // Transform questions to expected format
    const transformedQuestions: TransformedQuestion[] = useMemo(() => {
        if (!questionsData?.questions) return []
        return questionsData.questions.map(q => ({
            id: q.id,
            text: q.questionText,
            options: q.options?.map(opt => opt.optionText) || [],
            correctAnswer: q.options?.find(opt => opt.isCorrect)?.optionText || "",
            type: q.questionType === "mcq" ? "multiple_choice" as const : "true_false" as const
        }))
    }, [questionsData])

    // Combine quiz with transformed questions
    const quizWithQuestions = useMemo(() => {
        if (!quiz) return null
        return {
            ...quiz,
            questions: transformedQuestions,
            // Map fields to match component expectations
            numQuestions: quiz.totalQuestions,
            totalMarks: quiz.totalMarks,
            level: quiz.difficultyLevel,
            duration: quiz.timeLimit,
            chapters: quiz.chapters?.map(c => c.name)
        }
    }, [quiz, transformedQuestions])

    const isLoading = quizLoading || questionsLoading
    const error = quizQuery.error ?? questionsQuery.error
    const isCurrentCompletedQuizJob =
        activeJob?.artifactType === "quiz" &&
        activeJob.artifactId === quizId &&
        activeJob.status === "completed"
    const isAwaitingCompletedQuizContent =
        isCurrentCompletedQuizJob &&
        transformedQuestions.length === 0 &&
        (isLoading || quizFetching || questionsFetching)

    const refetch = async () => {
        await Promise.all([quizQuery.refetch(), questionsQuery.refetch()])
    }

    if (!quizId) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No quiz ID provided</p>
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
                        <p className="text-gray-600">Loading quiz...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isAwaitingCompletedQuizContent) {
        return (
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Opening generated quiz...</p>
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
                        <p className="text-red-500 mb-4">Error loading quiz: {error?.message || "Request failed"}</p>
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
            <GeneratedHeader
                className="shrink-0 mb-4"
                quizTitle={quizWithQuestions?.title}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <GeneratedQuiz quiz={quizWithQuestions} onSave={refetch} />
            </div>
        </div>
    )
}

export default function GeneratedQuizPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <GeneratedQuizPageContent />
        </Suspense>
    )
}
