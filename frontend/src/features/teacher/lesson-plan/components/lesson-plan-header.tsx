"use client"

import SearchBar from "@/components/search-bar"
import { SubjectSelect, ClassSelect } from "@/components/select-component"

interface LessonPlanHeaderProps {
    className?: string
    subject: string
    classValue: string
    onSubjectChange: (value: string) => void
    onClassChange: (value: string) => void
    subjects?: string[]
    classes?: Array<{ id: string; name: string; grade: number; section: string }>
    isClassesLoading?: boolean
    isSubjectsLoading?: boolean
}

export function LessonPlanHeader({ 
    className, 
    subject, 
    classValue, 
    onSubjectChange, 
    onClassChange,
    subjects,
    classes,
    isClassesLoading,
    isSubjectsLoading,
}: LessonPlanHeaderProps) {

    return (
        <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 pb-4 lg:pb-6 gap-4 ${className || ""}`}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between w-full">
                <h1 className="text-xl font-bold text-[#242220]">Create Lesson Plan</h1>
                <div className="flex items-center gap-2">
                    <ClassSelect
                        value={classValue}
                        onValueChange={onClassChange}
                        placeholder={isClassesLoading ? "Loading..." : "Class"}
                        classes={classes || undefined}
                        disabled={isClassesLoading || !classes?.length}
                        className="w-[90px] h-8 text-xs bg-[#9B61FF] text-white font-medium"
                        variant="simple"
                    />
                    <SubjectSelect
                        value={subject}
                        onValueChange={onSubjectChange}
                        placeholder={isSubjectsLoading ? "Loading..." : "Subject"}
                        subjects={subjects || undefined}
                        disabled={isSubjectsLoading || !subjects?.length}
                        className="w-[80px] h-8 text-xs border-[#9B61FF] bg-white text-[#9B61FF] font-medium"
                    />
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
                <h1 className="text-3xl font-bold text-[#242220]">Create Lesson Plan</h1>
            </div>
            <div className="hidden lg:flex items-center gap-4">
                <SearchBar />
                <ClassSelect
                    value={classValue}
                    onValueChange={onClassChange}
                    placeholder={isClassesLoading ? "Loading..." : "Select Class"}
                    classes={classes || undefined}
                    disabled={isClassesLoading || !classes?.length}
                    variant="simple"
                />
                <SubjectSelect
                    value={subject}
                    onValueChange={onSubjectChange}
                    placeholder={isSubjectsLoading ? "Loading..." : "Select Subject"}
                    subjects={subjects || undefined}
                    disabled={isSubjectsLoading || !subjects?.length}
                />
            </div>
        </div>
    )
}