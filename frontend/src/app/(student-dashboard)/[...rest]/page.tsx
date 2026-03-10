"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Catch-all for invalid student routes (e.g. /quiz/123 instead of /quizzes/123).
 * Redirects to student-home so we stay within the layout and avoid the root 404
 * which can cause "failed to fetch" cascade when navigating back.
 */
export default function StudentNotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/student-home")
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
      <p className="text-gray-500 text-center">Page not found. Redirecting...</p>
      <Link
        href="/student-home"
        className="text-[#DF6647] hover:underline font-medium"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
