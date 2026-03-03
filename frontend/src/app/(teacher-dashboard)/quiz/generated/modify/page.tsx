"use client"

import { Suspense } from "react"
import { ModifyQuizHeader } from "@/features/teacher/quiz/components/modify-quiz-header";
import ModifyQuizDetails from "@/features/teacher/quiz/components/modify-quiz-content";

function ModifyPageContent() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <ModifyQuizHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-hidden">
                <ModifyQuizDetails />
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
