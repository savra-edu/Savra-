"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"

// Fallback subjects in case API fails
const FALLBACK_SUBJECTS = [
  "All core Subjects",
  "English",
  "Hindi",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Science",
  "Geography",
  "Political Science (Civics)",
  "History",
  "Economics",
  "Computer Science",
]

interface StepSubjectSelectProps {
  onSelect: (subjects: string[]) => void
  value?: string[]
  onAddSubjectClick?: () => void
}

export function StepSubjectSelect({ onSelect, value = [], onAddSubjectClick }: StepSubjectSelectProps) {
  const [selected, setSelected] = useState<string[]>(value)
  const { data: subjects, isLoading } = useSubjects()

  const subjectOptions = subjects || FALLBACK_SUBJECTS

  const handleToggle = (subject: string) => {
    const newSelected = selected.includes(subject) ? selected.filter((s) => s !== subject) : [...selected, subject]
    setSelected(newSelected)
    onSelect(newSelected)
  }

  const handleRemove = (subject: string) => {
    const newSelected = selected.filter((s) => s !== subject)
    setSelected(newSelected)
    onSelect(newSelected)
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {subjectOptions.map((subject) => (
            <button
              key={subject}
              onClick={() => handleToggle(subject)}
              className={`px-4 py-2 rounded-full border-2 transition-colors font-medium text-sm ${
                selected.includes(subject)
                  ? "bg-[#E8E2F0] border-[#9B61FF] text-[#242220]"
                  : "border-gray-300 text-[#353535] hover:border-gray-400"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-[#353535] mb-3 font-medium">Selected subjects:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((subject) => (
              <div
                key={subject}
                className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-sm text-[#242220]">{subject}</span>
                <button onClick={() => handleRemove(subject)} className="text-[#8C8C8C] hover:text-[#242220]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAddSubjectClick}
        className="text-[#9B61FF] hover:text-[#7C3AED] text-sm font-medium block mx-auto"
      >
        Add Subject +
      </button>
    </div>
  )
}
