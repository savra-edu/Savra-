"use client"

import SearchBar from "@/components/search-bar"
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

interface QuizHeaderProps {
    className?: string
    classes?: Class[] | null
    subjects?: Subject[] | null
    selectedClassId: string
    selectedSubjectId: string
    onClassChange: (classId: string) => void
    onSubjectChange: (subjectId: string) => void
}

export function QuizHeader({
    className,
    classes,
    subjects,
    selectedClassId,
    selectedSubjectId,
    onClassChange,
    onSubjectChange
}: QuizHeaderProps) {
    return (
        <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 pb-4 lg:pb-6 gap-4 ${className || ""}`}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between w-full">
                <div className="flex items-center">
                    <Link href="/assessments">
                        <ChevronLeft className="w-6 h-6 text-black cursor-pointer" />
                    </Link>
                    <h1 className="text-xl font-bold text-[#242220] ml-3">Create Quiz</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedSubjectId || undefined} onValueChange={onSubjectChange}>
                        <SelectTrigger className="w-[80px] h-8 text-xs border-[#9B61FF] bg-white text-[#9B61FF] font-medium">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects?.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedClassId || undefined} onValueChange={onClassChange}>
                        <SelectTrigger className="w-[90px] h-8 text-xs bg-[#9B61FF] text-white font-medium border-[#9B61FF] [&_span]:text-white [&_svg]:!text-white [&_svg]:!opacity-100">
                            <SelectValue placeholder="Class" className="text-white placeholder:text-white" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>Class {c.grade}-{c.section}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
                <h1 className="text-3xl font-bold text-[#242220]">Create a Quiz</h1>
            </div>
            <div className="hidden lg:flex items-center gap-4">
                <SearchBar />
                {/* Subject Dropdown */}
                <Select value={selectedSubjectId || undefined} onValueChange={onSubjectChange}>
                    <SelectTrigger className="w-[120px] h-14 p-2 bg-white text-[#353535] font-medium border-0">
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* Class Dropdown */}
                <Select value={selectedClassId || undefined} onValueChange={onClassChange}>
                    <SelectTrigger className="w-[150px] h-10 p-2 bg-[#9B61FF] text-white font-semibold border-0 hover:bg-[#8B51EF] [&_span]:text-white [&_svg]:!text-white [&_svg]:!opacity-100">
                        <SelectValue placeholder="Select Class" className="text-white placeholder:text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                                Class {cls.grade}-{cls.section}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}