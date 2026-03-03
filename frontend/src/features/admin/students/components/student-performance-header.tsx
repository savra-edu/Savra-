"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Download, Loader2 } from "lucide-react"
import { AdminFilterBar } from "@/components/admin-filter-bar"
import AdminSearchBar from "@/components/admin-search-bar"
import { Button } from "@/components/ui/button"
import { AdminClass } from "@/hooks/use-admin"

interface StudentPerformanceHeaderProps {
    classData: AdminClass
}

export default function StudentPerformanceHeader({ classData }: StudentPerformanceHeaderProps) {
    const className = classData.name || `Class ${classData.grade} ${classData.section}`
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/reports/export?type=class&classId=${classData.id}&format=csv`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `class-${classData.grade}${classData.section}-report.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
            alert('Failed to export report. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

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
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Export Report
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
