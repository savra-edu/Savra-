"use client"

import { useState, useEffect } from "react"
import CreateLesson from "@/features/teacher/lesson-plan/components/create-plan"
import { LessonPlanHeader } from "@/features/teacher/lesson-plan/components/lesson-plan-header"
import { useTeacherSubjects } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"

export default function LessonPlanPage() {
    const { data: subjects } = useTeacherSubjects()
    const { data: classes } = useTeacherClasses()

    const [subject, setSubject] = useState<string>("")
    const [classValue, setClassValue] = useState<string>("")

    useEffect(() => {
        if (subjects && subjects.length > 0 && !subject) {
            setSubject(subjects[0])
        }
    }, [subjects, subject])

    useEffect(() => {
        if (classes && classes.length > 0 && !classValue) {
            const firstClass = classes[0]
            setClassValue(`Class: ${firstClass.grade} ${firstClass.section}`)
        }
    }, [classes, classValue])

    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <LessonPlanHeader
                className="flex-shrink-0 mb-4"
                subject={subject}
                classValue={classValue}
                onSubjectChange={setSubject}
                onClassChange={setClassValue}
                subjects={subjects ?? undefined}
                classes={classes ?? undefined}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <CreateLesson 
                    selectedSubject={subject}
                    selectedClass={classValue}
                />
            </div>
        </div>
    )
}