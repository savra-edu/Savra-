"use client"

import { useState, useEffect } from "react"
import SearchBar from "@/components/search-bar"
import { ClassSelect, SubjectSelect } from "@/components/select-component"
import { useAuth } from "@/contexts/auth-context"
import { useTeacherSubjects } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"

interface SeeAllHeaderProps {
    className?: string
}

export function SeeAllHeader({ className }: SeeAllHeaderProps) {
    const { user } = useAuth()
    const { data: subjects } = useTeacherSubjects()
    const { data: classes } = useTeacherClasses()
    const firstName = user?.name?.split(" ")[0] || "Teacher"

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
        <div className={`flex flex-row justify-between items-center border-b border-gray-200 pb-6 ${className || ""}`}>
            <div>
                <h1 className="text-3xl font-bold text-[#242220]">Hi, {firstName}!</h1>
                <p className="text-[#353535] font-medium text-lg">Hope you're having a good day</p>
            </div>
            <div className="flex items-center gap-4">
                <SearchBar />
                <SubjectSelect
                    value={subject}
                    onValueChange={setSubject}
                    placeholder="Select subject"
                    subjects={subjects || undefined}
                />
                <ClassSelect
                    value={classValue}
                    onValueChange={setClassValue}
                    placeholder="Select class"
                    classes={classes || undefined}
                />
            </div>
        </div>
    )
}