"use client"

import { useState } from "react"
import { CreatePaperHeader } from "@/features/teacher/assessments/components/create-paper-header"
import QuestionPaperForm from "@/features/teacher/assessments/components/question-paper-form"
import { useTeacherClasses } from "@/hooks/use-classes"
import { useTeacherSubjectsData } from "@/hooks/use-subjects"

export default function CreatePaperPage() {
    const { data: classes, isLoading: isClassesLoading } = useTeacherClasses()
    const { data: subjects, isLoading: isSubjectsLoading } = useTeacherSubjectsData()
    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
    const selectedGrade = classes?.find((c) => c.id === selectedClassId)?.grade ?? null

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <CreatePaperHeader
                className="flex-shrink-0 mb-4"
                classes={classes}
                subjects={subjects}
                selectedClassId={selectedClassId}
                selectedSubjectId={selectedSubjectId}
                onClassChange={setSelectedClassId}
                onSubjectChange={setSelectedSubjectId}
                isClassesLoading={isClassesLoading}
                isSubjectsLoading={isSubjectsLoading}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <QuestionPaperForm
                    selectedClassId={selectedClassId}
                    selectedSubjectId={selectedSubjectId}
                    selectedGrade={selectedGrade}
                />
            </div>
        </div>
    )
}