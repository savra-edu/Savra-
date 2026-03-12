"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/teacher/login")
    }
    if (!isLoading && user && user.role !== "admin") {
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

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null
  }

  return <>{children}</>
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAskSavraPage = pathname === "/admin/ask-savra"

  return (
    <AuthGuard>
      <main className="h-screen flex flex-row w-screen overflow-x-hidden">
        {!isAskSavraPage && <AdminSidebar />}
        <div
          className={`flex-1 max-w-full overflow-x-hidden flex flex-col h-full ${isAskSavraPage ? "w-full" : "ml-64 p-6"}`}
        >
          {children}
        </div>
      </main>
    </AuthGuard>
  )
}
