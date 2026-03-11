"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SubjectSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  subjects?: string[]
  disabled?: boolean
}

export function SubjectSelect({
  value,
  onValueChange,
  placeholder = "Select subject",
  className,
  subjects,
  disabled,
}: SubjectSelectProps) {
  const subjectList = subjects && subjects.length > 0 ? subjects : []

  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled || subjectList.length === 0}>
      <SelectTrigger
        className={cn(
          "w-[120px] h-14 p-2 bg-white ",
          "text-[#353535] font-medium",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[120px] max-h-60 overflow-y-auto bg-white p-1" side="bottom" position="popper">
        {subjectList.map((subject) => (
          <SelectItem
            key={subject}
            value={subject}
            className="px-6 py-3 rounded-xl cursor-pointer font-medium"
          >
            {subject}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface ClassData {
  id: string
  name: string
  grade: number
  section: string
}

interface ClassSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  classes?: ClassData[]
  disabled?: boolean
  /** "simple" = flat dropdown like Quiz (Class 8, Class 9, etc.); "full" = nested grade/section */
  variant?: "full" | "simple"
}

export function ClassSelect({
  value,
  onValueChange,
  placeholder = "Select Class",
  className,
  classes,
  disabled,
  variant = "full",
}: ClassSelectProps) {
  // Simple mode: one class per grade (like Quiz/Assessment)
  const classesByGrade =
    variant === "simple" && classes?.length
      ? [...classes]
          .filter((c) => c.grade >= 6)
          .sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section))
          .filter((c, i, arr) => arr.findIndex((x) => x.grade === c.grade) === i)
      : []

  // Only build grade structure from API classes - grades 6-12 only
  const gradeStructure = variant === "full" && classes && classes.length > 0
    ? Array.from(
        classes
          .filter((cls) => cls.grade >= 6)
          .reduce((acc, cls) => {
            if (!acc.has(cls.grade)) {
              acc.set(cls.grade, new Set())
            }
            acc.get(cls.grade)!.add(cls.section)
            return acc
          }, new Map<number, Set<string>>())
      ).map(([grade, sections]) => ({
        grade,
        sections: Array.from(sections).sort()
      })).sort((a, b) => a.grade - b.grade)
    : []

  // Parse value to internal format (e.g., "Class: 7 B" -> "7-B")
  const parseValue = (val?: string): string => {
    if (!val) return ""
    if (val.includes("-")) return val // Already in format "7-B"
    // Parse "Class: 7 B" format
    const match = val.match(/Class:\s*(\d+)\s*([A-E])/i)
    if (match) {
      return `${match[1]}-${match[2]}`
    }
    return val
  }

  // Format value for display (e.g., "7-B" -> "Class: 7 B")
  const formatValue = (val: string): string => {
    if (!val || val === "all") return ""
    if (val.includes("-")) {
      const [grade, section] = val.split("-")
      return `Class: ${grade} ${section}`
    }
    return val
  }

  const internalValue = parseValue(value)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Initialize expanded grades based on selected value
  const getInitialExpandedGrades = () => {
    if (internalValue && internalValue.includes("-")) {
      const gradeNum = parseInt(internalValue.split("-")[0])
      return new Set([gradeNum])
    }
    return new Set<number>()
  }
  
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(getInitialExpandedGrades())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelection = (sectionValue: string) => {
    const formattedValue = formatValue(sectionValue)
    onValueChange?.(formattedValue)
    setIsDropdownOpen(false)
  }

  const toggleGradeExpansion = (gradeNum: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedGrades(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gradeNum)) {
        newSet.delete(gradeNum)
      } else {
        newSet.add(gradeNum)
      }
      return newSet
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const displayValue = value ? formatValue(internalValue) : placeholder

  // Simple variant: flat "Class N" dropdown like Quiz/Assessment
  if (variant === "simple") {
    const gradeNum = internalValue ? parseInt(internalValue.split("-")[0]) : null
    const matchingOption = gradeNum ? classesByGrade.find((c) => c.grade === gradeNum) : null
    const simpleValue = matchingOption ? `Class: ${matchingOption.grade} ${matchingOption.section}` : undefined

    return (
      <Select
        value={simpleValue}
        onValueChange={(v) => onValueChange?.(v)}
        disabled={disabled || !classesByGrade.length}
      >
        <SelectTrigger
          className={cn(
            "w-[150px] h-10 p-2 bg-[#9B61FF] text-white font-semibold border-0 hover:bg-[#8B51EF]",
            "[&_span]:text-white [&_svg]:!text-white [&_svg]:!opacity-100",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto" side="bottom" position="popper">
          {classesByGrade.map((c) => {
            const itemValue = `Class: ${c.grade} ${c.section}`
            return (
              <SelectItem key={c.id} value={itemValue}>
                Class {c.grade}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { if (!disabled) setIsDropdownOpen(!isDropdownOpen) }}
        disabled={disabled}
        className={cn(
          "w-[150px] h-10 p-2 bg-[#9B61FF]",
          "text-white font-semibold",
          "border-0 focus:ring-0 focus:outline-none",
          "hover:bg-[#8B51EF]",
          "flex items-center justify-between gap-2",
          "transition-colors rounded-md",
          className
        )}
      >
        <span>{displayValue}</span>
        <ChevronDown className="w-4 h-4 text-white opacity-100 flex-shrink-0" />
      </button>

      {isDropdownOpen && (
        <div
          className={cn(
            "absolute top-full left-0 mt-1 z-50",
            "bg-white border border-[#9B61FF] rounded-md shadow-lg",
            "min-w-[200px] max-h-[400px] overflow-y-auto"
          )}
        >
          {/* Grade Items with Sections */}
          {gradeStructure.map(({ grade: gradeNum, sections }) => {
            const isExpanded = expandedGrades.has(gradeNum)
            const hasSelectedSection = sections.some(s => internalValue === `${gradeNum}-${s}`)

            return (
              <div key={gradeNum}>
                {/* Grade Header - Expandable */}
                <button
                  onClick={(e) => toggleGradeExpansion(gradeNum, e)}
                  className={cn(
                    "w-full px-6 py-3 text-left text-sm font-medium",
                    "hover:bg-[#F1E9FF] transition-colors rounded-xl",
                    "flex items-center justify-between",
                    hasSelectedSection && "bg-[#F1E9FF]"
                  )}
                >
                  <span>{gradeNum}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Sections - Shown when expanded */}
                {isExpanded && (
                  <div className="bg-gray-50">
                    {sections.map((section) => {
                      const sectionValue = `${gradeNum}-${section}`
                      const isSelected = internalValue === sectionValue
                      const displayText = `${gradeNum} ${section}`

                      return (
                        <button
                          key={sectionValue}
                          onClick={() => handleSelection(sectionValue)}
                          className={cn(
                            "w-full px-6 py-3 pl-10 text-left text-sm font-medium",
                            "hover:bg-[#F1E9FF] transition-colors rounded-xl",
                            isSelected && "bg-[#9B61FF] text-white"
                          )}
                        >
                          {displayText}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

