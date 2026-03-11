"use client"

import { useState } from "react"
import ClassroomsHeader from "@/features/admin/classrooms/components/classrooms-header";
import ClassroomsGrid from "@/features/admin/classrooms/components/classrooms-grid";

export default function ClassroomsPage() {
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [selectedGrade, setSelectedGrade] = useState("all")

    return (
        <div className="flex flex-col w-full p-8">
            <ClassroomsHeader
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
            />
            <ClassroomsGrid selectedGrade={selectedGrade} />
        </div>
    )
}
