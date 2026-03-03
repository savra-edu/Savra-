import { useState, useCallback, useEffect } from "react"
import { useFetch, useMutation } from "./use-api"
import { api, ApiError } from "@/lib/api"

// Types for quiz data
export interface QuizSubject {
  id: string
  name: string
}

export interface QuizChapter {
  id: string
  name: string
}

export interface QuizListItem {
  id: string
  title: string
  objective: string
  totalQuestions: number
  totalMarks: number
  timeLimit: number | null
  difficultyLevel: "easy" | "medium" | "hard"
  dueDate: string | null
  isOptional: boolean
  subject: QuizSubject
  attemptStatus: "not_attempted" | "in_progress" | "submitted" | "graded"
  latestScore: number | null
  latestPercentage: number | null
  attemptCount: number
  createdAt: string
}

export interface QuizDetails {
  id: string
  title: string
  objective: string
  totalQuestions: number
  totalMarks: number
  timeLimit: number | null
  difficultyLevel: "easy" | "medium" | "hard"
  dueDate: string | null
  isOptional: boolean
  subject: QuizSubject
  chapters: QuizChapter[]
  attemptCount: number
  inProgressAttempt: {
    id: string
    startedAt: string
  } | null
  latestCompletedAttempt: {
    id: string
    score: number
    percentage: number
    submittedAt: string
  } | null
  createdAt: string
}

export interface QuestionOption {
  id: string
  optionLabel: "A" | "B" | "C" | "D"
  optionText: string
  isCorrect?: boolean // Only in results
}

export interface QuizQuestion {
  id: string
  questionText: string
  questionType: "mcq" | "short_answer" | "long_answer" | "case_study"
  marks: number
  orderIndex: number
  options: QuestionOption[]
  submittedAnswer?: {
    selectedOptionId: string | null
    answerText: string | null
  } | null
}

export interface QuizAttemptData {
  attemptId: string
  status: "in_progress" | "submitted" | "graded"
  startedAt: string
  questions: QuizQuestion[]
}

export interface StartAttemptResponse {
  attemptId: string
  quizId: string
  timeLimit: number | null
  totalQuestions: number
  totalMarks: number
  startedAt: string
}

export interface SaveAnswerResponse {
  message: string
  answerId: string
  questionId: string
}

export interface SubmitQuizResponse {
  attemptId: string
  status: string
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  submittedAt: string
  gradedQuestions: number
  message: string
}

export interface QuizResultQuestion {
  id: string
  questionText: string
  questionType: "mcq" | "short_answer" | "long_answer" | "case_study"
  marks: number
  options: QuestionOption[]
  correctOptionId: string | null
  studentAnswer: {
    selectedOptionId: string | null
    answerText: string | null
    isCorrect: boolean | null
    marksObtained: number
  } | null
}

export interface QuizResults {
  attemptId: string
  quiz: {
    title: string
    totalQuestions: number
    totalMarks: number
  }
  status: "submitted" | "graded"
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  startedAt: string
  submittedAt: string
  questions: QuizResultQuestion[]
}

// Filter options for quiz list
export interface QuizFilters {
  subjectId?: string
  sortBy?: "createdAt" | "title" | "dueDate"
  sortOrder?: "asc" | "desc"
}

// Hook for paginated quiz list with filters
export function useStudentQuizzesPaginated(
  page = 1,
  limit = 10,
  filters?: QuizFilters
) {
  const [data, setData] = useState<QuizListItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", String(page))
      params.append("limit", String(limit))
      if (filters?.subjectId) params.append("subjectId", filters.subjectId)
      if (filters?.sortBy) params.append("sortBy", filters.sortBy)
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder)

      const response = await api.get<{
        success: boolean
        data: {
          quizzes: QuizListItem[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
          }
        }
      }>(`/student/quizzes?${params.toString()}`)

      setData(response.data.quizzes)
      setPagination(response.data.pagination)
      setIsLoading(false)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Request failed"
      setError(message)
      setIsLoading(false)
    }
  }, [page, limit, filters?.subjectId, filters?.sortBy, filters?.sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, pagination, refetch: fetchData }
}

// Hook to get quiz details (metadata before starting)
export function useQuizDetails(quizId: string | null) {
  return useFetch<QuizDetails>(quizId ? `/student/quizzes/${quizId}` : null)
}

// Hook to start a quiz attempt
export function useStartQuizAttempt(quizId: string) {
  return useMutation<void, StartAttemptResponse>(
    "post",
    `/student/quizzes/${quizId}/start`
  )
}

// Hook to get quiz questions for an attempt
export function useQuizAttempt(quizId: string | null, attemptId: string | null) {
  const endpoint =
    quizId && attemptId
      ? `/student/quizzes/${quizId}/attempt/${attemptId}`
      : null
  return useFetch<QuizAttemptData>(endpoint)
}

// Hook to save an answer
export function useSaveAnswer(quizId: string, attemptId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate } = useMutation<
    { questionId: string; selectedOptionId?: string | null; answerText?: string | null },
    SaveAnswerResponse
  >("post", `/student/quizzes/${quizId}/attempt/${attemptId}/answer`)

  const saveAnswer = useCallback(
    async (
      questionId: string,
      selectedOptionId?: string | null,
      answerText?: string | null
    ) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await mutate({ questionId, selectedOptionId, answerText })
        setIsLoading(false)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save answer"
        setError(message)
        setIsLoading(false)
        return null
      }
    },
    [mutate]
  )

  return { saveAnswer, isLoading, error }
}

// Hook to submit quiz
export function useSubmitQuiz(quizId: string, attemptId: string) {
  return useMutation<void, SubmitQuizResponse>(
    "patch",
    `/student/quizzes/${quizId}/attempt/${attemptId}/submit`
  )
}

// Hook to get quiz results
export function useQuizResults(quizId: string | null, attemptId: string | null) {
  const endpoint =
    quizId && attemptId
      ? `/student/quizzes/${quizId}/attempt/${attemptId}/results`
      : null
  return useFetch<QuizResults>(endpoint)
}
