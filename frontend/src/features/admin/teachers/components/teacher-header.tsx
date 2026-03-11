"use client"

import { AdminFilterBar } from "@/components/admin-filter-bar";
import AdminSearchBar from "@/components/admin-search-bar";

interface TeacherHeaderProps {
    selectedGrade?: string
    onGradeChange?: (value: string) => void
    selectedSubject?: string
    onSubjectChange?: (value: string) => void
}

export default function TeacherHeader({
    selectedGrade = "all",
    onGradeChange,
    selectedSubject = "All Subjects",
    onSubjectChange,
}: TeacherHeaderProps) {
    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-3xl text-[#353535]">Teachers</h1>
                <p className="text-[#353535] text-base">An overview of the teachers activity</p>
            </div>
            <div className="flex items-center gap-4">
                <AdminSearchBar />
                <AdminFilterBar
                    defaultGrade={selectedGrade}
                    defaultSubject={selectedSubject}
                    onGradeChange={onGradeChange}
                    onSubjectChange={onSubjectChange}
                />
            </div>
        </div>
    )
}