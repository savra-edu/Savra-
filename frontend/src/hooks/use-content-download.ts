"use client"

import { useCallback } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Lesson, Quiz } from "@/types/api"
import { generateLessonPlanPDF } from "@/lib/pdf-generator"
import { downloadLessonPlanDoc } from "@/lib/doc-generator"
import { downloadQuizPDF } from "@/lib/pdf-generator"
import { downloadQuizDoc } from "@/lib/doc-generator"
import { downloadAssessmentPDF } from "@/lib/pdf-generator"
import { downloadAssessmentDoc } from "@/lib/doc-generator"

function parseItemId(itemId: string): { type: string; realId: string } | null {
  if (!itemId || !itemId.includes("-")) return null
  const firstDash = itemId.indexOf("-")
  const type = itemId.substring(0, firstDash)
  const realId = itemId.substring(firstDash + 1)
  if (!realId || !["lesson", "quiz", "assessment"].includes(type)) return null
  return { type, realId }
}

function triggerBlobDownload(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Hook to handle PDF/Word download for lesson, quiz, or assessment from a composite item id (e.g. "lesson-123").
 */
export function useContentDownload(itemId: string) {
  const { user } = useAuth()
  const teacherName = user?.name || "Teacher"

  const handleDownloadPDF = useCallback(async () => {
    const parsed = parseItemId(itemId)
    if (!parsed) {
      alert("Invalid item")
      return
    }
    try {
      if (parsed.type === "lesson") {
        const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(
          `/lessons/${parsed.realId}`
        )
        const lesson = res?.data
        if (!lesson) {
          alert("Could not load lesson")
          return
        }
        const { url, filename } = generateLessonPlanPDF(
          lesson as unknown as Lesson,
          teacherName
        )
        triggerBlobDownload(url, filename)
      } else if (parsed.type === "quiz") {
        const [quizRes, questionsRes] = await Promise.all([
          api.get<{ success: boolean; data: Record<string, unknown> }>(
            `/quizzes/${parsed.realId}`
          ),
          api.get<{ success: boolean; data: { questions?: unknown[] } }>(
            `/quizzes/${parsed.realId}/questions`
          ),
        ])
        const quiz = quizRes?.data
        const questions = questionsRes?.data?.questions
        if (!quiz) {
          alert("Could not load quiz")
          return
        }
        const quizWithQuestions = {
          ...quiz,
          questions: questions || [],
        }
        downloadQuizPDF(
          quizWithQuestions as unknown as Quiz,
          teacherName
        )
      } else if (parsed.type === "assessment") {
        const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(
          `/assessments/${parsed.realId}`
        )
        const assessment = res?.data
        if (!assessment) {
          alert("Could not load assessment")
          return
        }
        downloadAssessmentPDF(assessment as unknown as Parameters<typeof downloadAssessmentPDF>[0], teacherName)
      }
    } catch (err) {
      console.error("Download failed:", err)
      alert(err instanceof Error ? err.message : "Download failed")
    }
  }, [itemId, teacherName])

  const handleDownloadWord = useCallback(async () => {
    const parsed = parseItemId(itemId)
    if (!parsed) {
      alert("Invalid item")
      return
    }
    try {
      if (parsed.type === "lesson") {
        const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(
          `/lessons/${parsed.realId}`
        )
        const lesson = res?.data
        if (!lesson) {
          alert("Could not load lesson")
          return
        }
        downloadLessonPlanDoc(
          lesson as unknown as Lesson,
          teacherName
        )
      } else if (parsed.type === "quiz") {
        const [quizRes, questionsRes] = await Promise.all([
          api.get<{ success: boolean; data: Record<string, unknown> }>(
            `/quizzes/${parsed.realId}`
          ),
          api.get<{ success: boolean; data: { questions?: unknown[] } }>(
            `/quizzes/${parsed.realId}/questions`
          ),
        ])
        const quiz = quizRes?.data
        const questions = questionsRes?.data?.questions
        if (!quiz) {
          alert("Could not load quiz")
          return
        }
        const quizWithQuestions = {
          ...quiz,
          questions: questions || [],
        }
        downloadQuizDoc(
          quizWithQuestions as unknown as Quiz,
          teacherName
        )
      } else if (parsed.type === "assessment") {
        const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(
          `/assessments/${parsed.realId}`
        )
        const assessment = res?.data
        if (!assessment) {
          alert("Could not load assessment")
          return
        }
        downloadAssessmentDoc(assessment as unknown as Parameters<typeof downloadAssessmentDoc>[0], teacherName)
      }
    } catch (err) {
      console.error("Download failed:", err)
      alert(err instanceof Error ? err.message : "Download failed")
    }
  }, [itemId, teacherName])

  const parsed = parseItemId(itemId)
  const canDownload = !!parsed

  return { handleDownloadPDF, handleDownloadWord, canDownload }
}
