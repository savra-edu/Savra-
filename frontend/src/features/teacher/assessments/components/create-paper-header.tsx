"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Class {
    id: string
    name: string
    grade: number
    section: string
}

interface Subject {
    id: string
    name: string
}

interface CreatePaperHeaderProps {
    className?: string
    classes?: Class[] | null
    subjects?: Subject[] | null
    selectedClassId: string
    selectedSubjectId: string
    onClassChange: (classId: string) => void
    onSubjectChange: (subjectId: string) => void
    isClassesLoading?: boolean
    isSubjectsLoading?: boolean
}

export function CreatePaperHeader({
    className,
    classes,
    subjects,
    selectedClassId,
    selectedSubjectId,
    onClassChange,
    onSubjectChange,
    isClassesLoading,
    isSubjectsLoading,
}: CreatePaperHeaderProps) {
    // One class per grade (sections share same chapters); use first section for each grade
    const classesByGrade = useMemo(() => {
        if (!classes?.length) return []
        const seen = new Set<number>()
        return [...classes]
            .sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section))
            .filter((c) => {
                if (seen.has(c.grade)) return false
                seen.add(c.grade)
                return true
            })
    }, [classes])

    return (
        <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 pb-4 lg:pb-6 gap-4 lg:gap-6 ${className || ""}`}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between w-full">
                <div className="flex items-center">
                    <Link href="/assessments">
                        <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
                    </Link>
                    <h1 className="text-xl font-bold text-[#242220] ml-3">Question Paper</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedClassId || undefined} onValueChange={onClassChange} disabled={isClassesLoading || !classesByGrade.length}>
                        <SelectTrigger className="w-[90px] h-8 text-xs bg-[#9B61FF] text-white font-medium border-[#9B61FF] [&_span]:text-white [&_svg]:text-white! [&_svg]:opacity-100!">
                            <SelectValue placeholder={isClassesLoading ? "Loading..." : "Class"} className="text-white placeholder:text-white" />
                        </SelectTrigger>
                        <SelectContent>
                            {classesByGrade.map((c) => (
                                <SelectItem key={c.id} value={c.id}>Class {c.grade}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedSubjectId || undefined} onValueChange={onSubjectChange} disabled={isSubjectsLoading || !subjects?.length}>
                        <SelectTrigger className="w-[80px] h-8 text-xs border-[#9B61FF] bg-white text-[#9B61FF] font-medium">
                            <SelectValue placeholder={isSubjectsLoading ? "Loading..." : "Subject"} />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects?.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
                <Link href="/assessments">
                    <ChevronLeft className="w-12 h-12 text-black rounded-full p-4 bg-[#F5F5F5] cursor-pointer hover:bg-[#E5E5E5] transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold text-[#242220]">Create Question Paper</h1>
            </div>
            <div className="hidden lg:flex items-center gap-4 xl:gap-5 ml-auto shrink-0">
                {/* Class Dropdown */}
                <Select value={selectedClassId || undefined} onValueChange={onClassChange} disabled={isClassesLoading || !classesByGrade.length}>
                    <SelectTrigger className="w-[190px] h-12 px-5 bg-[#9B61FF] text-white font-semibold border-0 hover:bg-[#8B51EF] shadow-sm [&_span]:text-white [&_svg]:text-white! [&_svg]:opacity-100!">
                        <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select Class"} className="text-white placeholder:text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        {classesByGrade.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                Class {c.grade}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* Subject Dropdown */}
                <Select value={selectedSubjectId || undefined} onValueChange={onSubjectChange} disabled={isSubjectsLoading || !subjects?.length}>
                    <SelectTrigger className="w-[180px] h-12 px-5 bg-white text-[#353535] font-medium border border-[#E5D9FF] shadow-sm">
                        <SelectValue placeholder={isSubjectsLoading ? "Loading..." : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}