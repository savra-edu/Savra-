import { useFetch, useMutation } from "./use-api"
import { useAuth } from "@/contexts/auth-context"
import { useCachedStudentClass, useCachedStudentSubjects } from "@/contexts/data-context"

interface StudentClass {
  id: string
  name: string
  grade: number | string
  section?: string
  school?: {
    id: string
    name: string
  }
}

interface StudentData {
  studentId: string
  classId?: string
  rollNumber?: string | null
  totalPoints: number
  class: StudentClass
}

export interface StudentProfile {
  id: string
  email: string
  name: string
  role: "student"
  avatarUrl?: string | null
  createdAt: string
  updatedAt?: string
  // Backend returns 'profile' not 'student'
  profile?: StudentData
  student?: StudentData
}

interface StudentPerformance {
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  totalPoints: number
  rank?: number
}

// Quiz types - matches backend /student/quizzes response
export interface StudentQuiz {
  id: string
  title: string
  objective: string
  subject: {
    id: string
    name: string
  }
  totalQuestions: number
  totalMarks: number
  timeLimit: number | null
  difficultyLevel: "easy" | "medium" | "hard"
  dueDate: string | null
  isOptional: boolean
  attemptStatus: "not_attempted" | "in_progress" | "submitted" | "graded"
  latestScore: number | null
  latestPercentage: number | null
  attemptCount: number
  createdAt: string
  // Aliases for backward compatibility with home-dashboard
  duration?: number
  questionCount?: number
}

// Announcement types - matches backend /student/announcements response
export interface StudentAnnouncement {
  id: string
  title: string
  content: string
  attachmentUrl?: string | null
  teacherName: string
  subject?: {
    id: string
    name: string
  }
  createdAt: string
  isRead?: boolean
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string
  rank: number
  userId: string
  name: string
  avatarUrl?: string | null
  totalPoints: number
  class?: {
    grade: string
    section?: string
  }
}

// Full leaderboard response (for full page)
export interface LeaderboardRanking {
  rank: number
  studentId: string
  name: string
  points: number
  isCurrentUser: boolean
}

export interface LeaderboardData {
  class: {
    id: string
    name: string
    grade: string
    section?: string
  }
  currentUserRank: number
  totalStudents: number
  rankings: LeaderboardRanking[]
}

// Uses cached user data from AuthContext - no duplicate API calls!
export function useStudentProfile() {
  const { user, isLoading, refreshUser } = useAuth()

  return {
    data: user as StudentProfile | null,
    isLoading,
    error: null,
    refetch: refreshUser,
  }
}

export function useStudentPerformance() {
  return useFetch<StudentPerformance>("/student/performance")
}

export function useUpdateStudentProfile() {
  return useMutation<Partial<{ name: string; email: string }>, StudentProfile>(
    "put",
    "/student/profile"
  )
}

// Home dashboard hooks
interface StudentQuizzesResponse {
  quizzes: StudentQuiz[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useStudentQuizzes(limit = 3, status?: string) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (status) params.append("status", status)
  const result = useFetch<StudentQuizzesResponse>(`/student/quizzes?${params}`)

  // Extract quizzes array from the response
  return {
    ...result,
    data: result.data?.quizzes || null,
  }
}

interface StudentAnnouncementsResponse {
  announcements: StudentAnnouncement[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useStudentAnnouncements(limit = 3) {
  const result = useFetch<StudentAnnouncementsResponse>(`/student/announcements?limit=${limit}`)

  // Extract announcements array from the response
  return {
    ...result,
    data: result.data?.announcements || null,
  }
}

interface LeaderboardResponse {
  class: {
    id: string
    name: string
    grade: string
    section?: string
  }
  currentUserRank: number
  totalStudents: number
  rankings: {
    rank: number
    studentId: string
    name: string
    points: number
    isCurrentUser: boolean
  }[]
}

export function useLeaderboard(limit = 3, period?: "weekly" | "monthly" | "all") {
  const params = new URLSearchParams({ limit: String(limit) })
  if (period) params.append("period", period)
  const result = useFetch<LeaderboardResponse>(`/student/leaderboard?${params}`)

  // Transform rankings to LeaderboardEntry format
  const leaderboardEntries: LeaderboardEntry[] | undefined = result.data?.rankings?.map(r => ({
    id: r.studentId,
    rank: r.rank,
    userId: r.studentId,
    name: r.name,
    avatarUrl: null,
    totalPoints: r.points,
  }))

  return {
    ...result,
    data: leaderboardEntries,
    classInfo: result.data?.class,
    currentUserRank: result.data?.currentUserRank,
    totalStudents: result.data?.totalStudents,
  }
}

// Full leaderboard for the full page view (no limit)
export function useFullLeaderboard() {
  return useFetch<LeaderboardData>("/student/leaderboard")
}

// Cached student class (from DataContext)
export function useStudentClass() {
  return useCachedStudentClass()
}

// Cached student subjects (from DataContext)
export function useStudentSubjects() {
  return useCachedStudentSubjects()
}

// For profile editing: Get all available subjects
export function useAllSubjects() {
  return useFetch<{ subjects: Array<{ id: string; name: string; code?: string }> }>("/student/all-subjects")
}

// For profile editing: Get all classes in student's school
export function useSchoolClasses() {
  return useFetch<{ classes: Array<{ id: string; name: string; grade: number; section: string }> }>("/student/school-classes")
}
