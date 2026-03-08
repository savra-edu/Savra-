"use client"

import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TeacherBottomNav } from "@/components/teacher-bottom-nav"
import { useAuth } from "@/contexts/auth-context"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/teacher/login")
    }
    if (!isLoading && user && user.role !== "teacher") {
      router.push("/teacher/login")
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "teacher")) {
    return null
  }

  return <>{children}</>
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isQuizDetailPage = pathname?.startsWith("/quizzes/") && pathname !== "/quizzes"
  const isEditLessonPlanPage = pathname?.startsWith("/lesson-plan/edit")
  const isCreateQuizPage = pathname === "/quiz"
  const isGeneratedQuizPage = pathname?.startsWith("/quiz/generated")
  const isQuestionPaperPage = pathname?.startsWith("/assessments/create/question-paper")
  const isModifyPromptPage = pathname?.startsWith("/assessments/create/modify")
  const isAnnouncementsPage = pathname === "/announcements"
  const isAccountSetup = searchParams?.get("setup") === "true"
  const isAskSavraPage = pathname === "/ask-savra-page"
  const shouldHideBottomNav = isQuizDetailPage || isEditLessonPlanPage || isCreateQuizPage || isGeneratedQuizPage || isQuestionPaperPage || isModifyPromptPage || isAnnouncementsPage || isAccountSetup || isAskSavraPage
  const shouldHideSidebar = isAskSavraPage || isEditLessonPlanPage

  return (
    <AuthGuard>
      <main className="h-screen flex flex-row w-screen overflow-x-hidden">
        {!shouldHideSidebar && <Sidebar />}
        <div className={`flex-1 ${shouldHideSidebar ? "" : "lg:ml-64"} p-3 lg:p-6 max-w-full overflow-x-hidden flex flex-col h-full ${shouldHideBottomNav ? "pb-0 lg:pb-6" : "pb-20 lg:pb-6"}`}>
          {children}
        </div>
        {!shouldHideBottomNav && <TeacherBottomNav />}
      </main>
    </AuthGuard>
  )
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <main className="h-screen flex flex-row w-screen overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-3 lg:p-6 max-w-full overflow-x-hidden flex flex-col h-full pb-20 lg:pb-6">
          {children}
        </div>
        <TeacherBottomNav />
      </main>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}
