"use client"

import { useState } from "react"
import { QuestionPaperHeader } from "@/features/teacher/assessments/components/question-header";
import QuestionPaperContent from "@/features/teacher/assessments/components/question-paper-content";

export default function QuestionPaperPage() {
    const [isEditMode, setIsEditMode] = useState(false)

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <QuestionPaperHeader 
                className="flex-shrink-0 mb-4" 
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