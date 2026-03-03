import { useCachedTeacherSubjects, useCachedTeacherSubjectNames, useCachedAllSubjects, useCachedAllSubjectNames } from "@/contexts/data-context"

// Re-export types for backward compatibility
export interface Subject {
  id: string
  name: string
  code?: string
}

export interface TeacherSubject {
  id: string
  name: string
  lessonCount?: number
  quizCount?: number
}

// Returns ALL subject objects (for profile editing where you can add new subjects)
// Uses cached data from DataProvider
export function useSubjectsData() {
  return useCachedAllSubjects()
}

// Returns just ALL subject names as strings (for profile editing)
// Uses cached data from DataProvider
export function useSubjects() {
  return useCachedAllSubjectNames()
}

// Returns teacher's ASSIGNED subjects with full data (for header dropdowns/filtering)
// Uses cached data from DataProvider - no duplicate API calls!
export function useTeacherSubjectsData() {
  return useCachedTeacherSubjects()
}

// Returns teacher's ASSIGNED subject names as strings (for header dropdowns)
// Uses cached data from DataProvider - no duplicate API calls!
export function useTeacherSubjects() {
  return useCachedTeacherSubjectNames()
}

// Returns subjects available for student's class (from published quizzes)
import { useFetch } from "./use-api"

export function useStudentSubjects() {
  const { data, isLoading, error } = useFetch<{ subjects: Subject[] }>(
    '/student/subjects',
    true
  )
  return {
    subjects: data?.subjects || [],
    isLoading,
    error,
  }
}
