"use client"

import { useState } from "react"
import QuizContent from "@/features/teacher/quiz/components/quiz-content"
import { QuizHeader } from "@/features/teacher/quiz/components/quiz-header"
import { useTeacherClasses } from "@/hooks/use-classes"
import { useTeacherSubjectsData } from "@/hooks/use-subjects"

export default function CreateQuiz() {
    const { data: classes } = useTeacherClasses()
    const { data: subjects } = useTeacherSubjectsData()
    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <QuizHeader
                className="flex-shrink-0 mb-4"
                classes={classes}
                subjects={subjects}
                selectedClassId={selectedClassId}
                selectedSubjectId={selectedSubjectId}
                onClassChange={setSelectedClassId}
                onSubjectChange={setSelectedSubjectId}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <QuizContent
                    selectedClassId={selectedClassId}
                    selectedSubjectId={selectedSubjectId}
                />
            </div>
        </div>
    )
}