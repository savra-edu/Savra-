"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { AdminFilterBar } from "@/components/admin-filter-bar"
import AdminSearchBar from "@/components/admin-search-bar"
import { AdminClass } from "@/hooks/use-admin"

interface StudentPerformanceHeaderProps {
    classData: AdminClass
}

export default function StudentPerformanceHeader({ classData }: StudentPerformanceHeaderProps) {
    const className = classData.name || `Class ${classData.grade} ${classData.section}`

    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-6">
            <div className="flex items-center gap-4">
                <Link href="/students">
                    <ChevronLeft className="w-12 h-12 text-black rounded-full p-4 bg-[#F5F5F5] cursor-pointer hover:bg-[#E5E5E5] transition-colors" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-3xl text-[#242220]">{className}</h1>
                    <p className="text-[#353535] font-normal text-base">An overview of the student activity</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <AdminSearchBar />
                <AdminFilterBar />
            </div>
        </div>
    )
}
