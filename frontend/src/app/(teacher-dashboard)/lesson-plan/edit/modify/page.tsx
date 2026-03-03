"use client"

import { Suspense } from "react"
import ModifyDetails from "@/features/teacher/lesson-plan/components/modify-details";
import { ModifyHeader } from "@/features/teacher/lesson-plan/components/modify-header";

function ModifyPageContent() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <ModifyHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-hidden">
                <ModifyDetails />
            </div>
        </div>
    )
}

export default function ModifyPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <ModifyPageContent />
        </Suspense>
    )
}
