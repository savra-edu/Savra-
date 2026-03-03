"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ClassroomsHeaderProps {
    searchQuery?: string
    onSearchChange?: (value: string) => void
    selectedSubject?: string
    onSubjectChange?: (value: string) => void
    selectedGrade?: string
    onGradeChange?: (value: string) => void
}

export default function ClassroomsHeader({
    searchQuery = "",
    onSearchChange,
    selectedSubject = "all",
    onSubjectChange,
    selectedGrade = "all",
    onGradeChange,
}: ClassroomsHeaderProps) {
    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-3xl text-[#353535]">Classrooms</h1>
                <p className="text-[#353535] text-base">An overview of the student activity</p>
            </div>
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Ask Savra AI"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 bg-white"
                    />
                </div>

                {/* Subject Filter */}
                <Select value={selectedSubject} onValueChange={onSubjectChange}>
                    <SelectTrigger className="w-[140px] rounded-lg border border-gray-200 bg-white">
                        <SelectValue placeholder="All Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subject</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                </Select>

                {/* Grade Filter */}
                <Select value={selectedGrade} onValueChange={onGradeChange}>
                    <SelectTrigger className="w-[140px] rounded-lg bg-[#7C3AED] text-white border-0">
                        <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
