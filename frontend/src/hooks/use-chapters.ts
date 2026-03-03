import { useFetch } from "./use-api"

interface Chapter {
  id: string
  name: string
  subject?: string
}

export function useChapters(subjectId?: string) {
  const endpoint = subjectId ? `/chapters?subject=${subjectId}` : "/chapters"
  return useFetch<Chapter[]>(endpoint)
}

// Returns just chapter names as strings for simpler components
export function useChapterNames(subjectId?: string) {
  const { data, isLoading, error } = useChapters(subjectId)
  return {
    data: data?.map(chapter => chapter.name) || null,
    isLoading,
    error
  }
}
