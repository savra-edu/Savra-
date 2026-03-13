"use client"

import { useState, useEffect } from "react"
import SearchBar from "@/components/search-bar"
import { SubjectSelect, ClassSelect } from "@/components/select-component"
import Link from "next/link"
import { ChevronLeft, Pencil } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTeacherSubjects } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"
import { getHistoryAwareBackHref } from "@/lib/history-navigation"

interface QuestionPaperHeaderProps {
    className?: string
    onEditClick?: () => void
    isEditMode?: boolean
}

export function QuestionPaperHeader({ className, onEditClick, isEditMode = false }: QuestionPaperHeaderProps) {
    const searchParams = useSearchParams()
    const { data: subjects } = useTeacherSubjects()
    const { data: classes } = useTeacherClasses()
    const backHref = getHistoryAwareBackHref(searchParams.get("from"), "/assessments/create")

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
            <div className="lg:hidden flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <Link href={backHref}>
                        <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
                    </Link>
                    <h1 className="text-xl font-bold text-[#242220]">Question Paper</h1>
                </div>
                {onEditClick && (
                    <button
                        onClick={onEditClick}
                        className={`font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                            isEditMode 
                                ? "bg-[#DF6647] hover:bg-[#DF6647]/90 text-white" 
                                : "bg-[#9B61FF] hover:bg-[#8B51EF] text-white"
                        }`}
                    >
                        <Pencil className="w-4 h-4" />
                        <span>{isEditMode ? "Done" : "Edit"}</span>
                    </button>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-4">
                <Link href={backHref}>
                    <ChevronLeft className="w-12 h-12 text-black rounded-full p-4 bg-[#F5F5F5] cursor-pointer hover:bg-[#E5E5E5] transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-[#242220]">Question Paper</h1>
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