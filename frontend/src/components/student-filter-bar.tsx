"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useStudentProfile } from "@/hooks/use-student"

interface Subject {
  id: string
  name: string
}

interface StudentFilterBarProps {
  className?: string
  onSubjectChange?: (value: string) => void
  selectedSubject?: string
  defaultSubject?: string
  classDisplay?: string
  subjects?: Subject[] | string[]
  isLoading?: boolean
}

export function StudentFilterBar({
  className,
  onSubjectChange,
  selectedSubject,
  defaultSubject = "all",
  classDisplay: classDisplayProp,
  subjects,
  isLoading = false
}: StudentFilterBarProps) {
  const [internalSubject, setInternalSubject] = useState<string>(defaultSubject)
  const { data: profile } = useStudentProfile()

  // Use controlled value if provided, otherwise use internal state
  const currentSubject = selectedSubject !== undefined ? selectedSubject : internalSubject

  // Get real class from profile (backend returns 'profile' not 'student')
  const studentData = profile?.profile || profile?.student
  const studentClass = studentData?.class
  const classDisplay = classDisplayProp || (studentClass
    ? `${studentClass.grade}-${studentClass.section || ''}`
    : "Class")

  const handleSubjectChange = (value: string) => {
    if (selectedSubject === undefined) {
      setInternalSubject(value)
    }
    onSubjectChange?.(value)
  }

  // Normalize subjects to array of {id, name}
  const normalizedSubjects: Subject[] = subjects
    ? subjects.map(s => typeof s === 'string' ? { id: s, name: s } : s)
    : []

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Static Class Display */}
      <div
        className={cn(
          "px-6 py-2 rounded-md max-w-[100px] border border-[#C7B1EE]",
          "bg-white text-[#353535] font-medium whitespace-nowrap",
          "flex items-center justify-center",
          "cursor-default"
        )}
      >
        {classDisplay}
      </div>

      {/* Subject Dropdown */}
      <Select value={currentSubject} onValueChange={handleSubjectChange}>
        <SelectTrigger
          className={cn(
            "px-4 py-4 rounded-md min-w-[80px]",
            "bg-[#9B61FF] text-white font-medium",
            "border-0 focus:ring-0",
            "hover:bg-[#8B51EF]",
            "[&_svg]:text-white [&_svg]:opacity-100",
            "data-[placeholder]:text-white"
          )}
        >
          <SelectValue placeholder="All Subjects" />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          align="start"
          position="popper"
          sideOffset={4}
          className="bg-white min-w-[140px] border border-[#9B61FF]"
        >
          <SelectItem
            value="all"
            className="px-4 py-2 cursor-pointer font-medium data-[highlighted]:bg-[#F1E9FF]"
          >
            All Subjects
          </SelectItem>
          {normalizedSubjects.map((subj) => (
            <SelectItem
              key={subj.id}
              value={subj.id}
              className="px-4 py-2 cursor-pointer font-medium data-[highlighted]:bg-[#F1E9FF]"
            >
              {subj.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
