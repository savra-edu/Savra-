import { useState, useEffect, useCallback } from "react"
import { useFetch, useMutation } from "./use-api"
import { api, ApiError } from "@/lib/api"

// Types for announcement data
export interface Announcement {
  id: string
  title: string
  content: string
  attachmentUrl: string | null
  teacherName: string
  createdAt: string
}

export interface AnnouncementDetails {
  id: string
  title: string
  content: string
  attachmentUrl: string | null
  teacherName: string
  createdAt: string
}

export interface MarkReadResponse {
  marked: boolean
  readAt: string
}

// Hook for paginated announcement list
export function useStudentAnnouncementsPaginated(page = 1, limit = 10) {
  const [data, setData] = useState<Announcement[] | null>(null)
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
      const response = await api.get<{
        success: boolean
        data: {
          announcements: Announcement[]
          pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
          }
        }
      }>(`/student/announcements?page=${page}&limit=${limit}`)

      setData(response.data.announcements)
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
  }, [page, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, pagination, refetch: fetchData }
}

// Hook to get single announcement details
export function useAnnouncementDetails(announcementId: string | null) {
  return useFetch<AnnouncementDetails>(
    announcementId ? `/student/announcements/${announcementId}` : null
  )
}

// Hook to mark announcement as read
export function useMarkAnnouncementRead(announcementId: string | null) {
  const { mutate, isLoading, error } = useMutation<void, MarkReadResponse>(
    "post",
    announcementId ? `/student/announcements/${announcementId}/read` : ""
  )

  // Auto-mark as read when announcementId is provided
  useEffect(() => {
    if (announcementId) {
      mutate()
    }
  }, [announcementId, mutate])

  return { isLoading, error }
}
