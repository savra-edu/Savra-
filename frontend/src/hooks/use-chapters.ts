import { useFetch } from "./use-api"

interface Chapter {
  id: string
  name: string
  subject?: string
}

/**
 * Fetches chapters for a subject, optionally filtered by grade.
 * When grade is provided, only grade-specific chapters (e.g. Grade 9 Chemistry) are returned.
 */
export function useChapters(subjectId?: string | null, grade?: number | null) {
  const params = new URLSearchParams()
  if (subjectId) params.set("subject", subjectId)
  if (grade != null && grade > 0) params.set("grade", String(grade))
  const query = params.toString()
  const endpoint = query ? `/chapters?${query}` : null
  return useFetch<Chapter[]>(endpoint)
}

// Returns just chapter names as strings for simpler components
export function useChapterNames(subjectId?: string, grade?: number | null) {
  const { data, isLoading, error } = useChapters(subjectId, grade)
  return {
    data: data?.map(chapter => chapter.name) || null,
    isLoading,
    error
  }
}
