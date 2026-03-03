"use client"

import { useState, useEffect } from "react"
import SearchBar from "@/components/search-bar"
import { SubjectSelect, ClassSelect } from "@/components/select-component"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useTeacherSubjects } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"

interface ModifyQuizHeaderProps {
    className?: string
}

export function ModifyQuizHeader({ className }: ModifyQuizHeaderProps) {
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
            <div className="lg:hidden flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/quiz/generated">
                        <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
                    </Link>
                    <h1 className="text-xl font-bold text-[#242220]">Modify Prompt</h1>
                </div>
                <div className="flex items-center gap-2">
                    <SubjectSelect
                        value={subject}
                        onValueChange={setSubject}
                        placeholder="Subject"
                        subjects={subjects || undefined}
                        className="w-[80px] h-8 text-xs border-[#9B61FF] bg-white text-[#9B61FF] font-medium"
                    />
                    <ClassSelect
                        value={classValue}
                        onValueChange={setClassValue}
                        placeholder="Class"
                        classes={classes || undefined}
                        className="w-[90px] h-8 text-xs bg-[#9B61FF] text-white font-medium"
                    />
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
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
