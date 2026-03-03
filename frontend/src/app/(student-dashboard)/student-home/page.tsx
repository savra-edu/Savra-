"use client"

import { useState } from "react";
import DashboardPage from "@/features/student/home/components/home-dashboard";
import HomeHeader from "@/features/student/home/components/home-header";
import { useStudentClass, useStudentSubjects } from "@/hooks/use-student";

export default function StudentHomePage() {
    const { data: studentClass } = useStudentClass()
    const { data: subjects } = useStudentSubjects()
    const [selectedSubject, setSelectedSubject] = useState<string>("all")

    return (
        <div className="flex flex-col max-w-full p-4 lg:p-8">
            <HomeHeader
                studentClass={studentClass}
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
            />
            <DashboardPage />
        </div>
    )
}