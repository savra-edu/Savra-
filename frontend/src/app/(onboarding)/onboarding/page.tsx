import { Suspense } from "react"
import Onboarding from "@/features/onboarding/onboarding"

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#F9F9F9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Onboarding />
    </Suspense>
  )
}