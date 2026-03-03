"use client"

import { useState, useEffect } from "react"
import SearchBar from "@/components/search-bar"
import { SubjectSelect, ClassSelect } from "../../../../components/select-component"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useTeacherSubjects } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"

interface ModifyHeaderProps {
    className?: string
}

export function ModifyHeader({ className }: ModifyHeaderProps) {
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
        <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 pb-4 lg:pb-6 gap-4 ${className || ""}`}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3">
                <Link href="/lesson-plan/edit">
                    <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
                </Link>
                <h1 className="text-xl font-bold text-[#242220]">Modify Prompt</h1>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-4">
                <Link href="/lesson-plan/edit">
                    <ChevronLeft className="w-12 h-12 text-black rounded-full p-4 bg-[#F5F5F5] cursor-pointer hover:bg-[#E5E5E5] transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-[#242220]">Modify Prompt</h1>
            </div>
            <div className="hidden lg:flex items-center gap-4">
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
