"use client"

import { useState } from "react"
import TeacherHeader from "@/features/admin/teachers/components/teacher-header";
import DashboardTable from "@/features/admin/teachers/components/teachers-table";


export default function AdminTeachersPage() {
    const [selectedGrade, setSelectedGrade] = useState<string>("all")
    const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects")

    return (
        <div className="flex flex-col w-full p-8">
            <TeacherHeader
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
            />
            <DashboardTable
                gradeFilter={selectedGrade}
                subjectFilter={selectedSubject}
            />
        </div>
    )
}