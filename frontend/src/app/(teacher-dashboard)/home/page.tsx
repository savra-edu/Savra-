"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import HomeHeader from "@/features/teacher/home/components/home-header";
import { QuickActions } from "@/features/teacher/home/components/quick-actions";
import { RecentActivity } from "@/features/teacher/home/components/recent-activity";
import AccountSetup from "@/features/teacher/login/components/account-setup";

function HomePageContent() {
  const searchParams = useSearchParams()
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const setup = searchParams.get("setup")
    setShowSetup(setup === "true")
  }, [searchParams])

  if (showSetup) {
    return <AccountSetup />
  }

  return (
    <div className="flex flex-col max-w-full p-4 lg:p-8">
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>
      <div className="flex-shrink-0">
        <QuickActions />
      </div>
      {/* <RecentLoginQuickActions /> */}
      {/* <CreateFirstLesson /> */}
      <div className="flex-1 min-h-0">
        <RecentActivity />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col max-w-full p-4 lg:p-8">
        <div className="flex-shrink-0">
          <HomeHeader />
        </div>
        <div className="flex-shrink-0">
          <QuickActions />
        </div>
        <div className="flex-1 min-h-0">
          <RecentActivity />
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}