"use client"

import { Suspense, useState } from "react"
import { QuestionPaperHeader } from "@/features/teacher/assessments/components/question-header";
import QuestionPaperContent from "@/features/teacher/assessments/components/question-paper-content";

function QuestionPaperPageContent() {
    const [isEditMode, setIsEditMode] = useState(false)

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <QuestionPaperHeader 
                className="shrink-0 mb-4" 
                onEditClick={() => setIsEditMode(!isEditMode)}
                isEditMode={isEditMode}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <QuestionPaperContent 
                    onEditClick={setIsEditMode}
                    isEditMode={isEditMode}
                />
            </div>
        </div>
    )
}

export default function QuestionPaperPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full p-4 lg:p-8">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <QuestionPaperPageContent />
        </Suspense>
    )
}