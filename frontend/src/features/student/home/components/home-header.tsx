"use client"

import StudentSearchBar from "@/components/student-search-bar";
import { StudentFilterBar } from "@/components/student-filter-bar";
import { User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";

interface StudentClass {
    id: string;
    name: string;
    grade: number | string;
    section?: string;
}

interface StudentSubject {
    id: string;
    name: string;
}

interface HomeHeaderProps {
    studentClass?: StudentClass | null;
    subjects?: StudentSubject[] | null;
    selectedSubject?: string;
    onSubjectChange?: (value: string) => void;
}

export default function HomeHeader({ studentClass, subjects, selectedSubject, onSubjectChange }: HomeHeaderProps) {
    const { user, isLoading } = useAuth()

    // Get first name for greeting
    const firstName = user?.name?.split(" ")[0] || "Student"
    const avatarUrl = user?.avatarUrl

    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2 lg:gap-4">
                <Link href="/profile" className="lg:pointer-events-none">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer lg:cursor-default hover:bg-gray-300 lg:hover:bg-gray-200 transition-colors overflow-hidden">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                width={48}
                                height={48}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                        )}
                    </div>
                </Link>
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <h1 className="text-base lg:text-3xl font-bold text-[#242220]">Hi, {firstName}!</h1>
                    )}
                    {/* Class Badge */}
                    {studentClass && (
                        <span className="text-xs lg:text-sm text-gray-600">
                            Class {studentClass.grade}{studentClass.section ? `-${studentClass.section}` : ''}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                <div className="hidden lg:block">
                    <StudentSearchBar />
                </div>
                <StudentFilterBar
                    subjects={subjects || undefined}
                    selectedSubject={selectedSubject}
                    onSubjectChange={onSubjectChange}
                />
            </div>
        </div>
    )
}