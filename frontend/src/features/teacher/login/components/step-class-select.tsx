"use client"

import { useState } from "react"
import { X } from "lucide-react"

// Classes available (6-12 based on NCERT books)
const CLASS_OPTIONS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
]

interface StepClassSelectProps {
  onSelect: (classes: string[]) => void
  value?: string[]
}

export function StepClassSelect({ onSelect, value = [] }: StepClassSelectProps) {
  const [selected, setSelected] = useState<string[]>(value)

  const handleToggle = (classOption: string) => {
    const newSelected = selected.includes(classOption)
      ? selected.filter((c) => c !== classOption)
      : [...selected, classOption]
    setSelected(newSelected)
    onSelect(newSelected)
  }

  const handleRemove = (classOption: string) => {
    const newSelected = selected.filter((c) => c !== classOption)
    setSelected(newSelected)
    onSelect(newSelected)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {CLASS_OPTIONS.map((classOption) => (
          <button
            key={classOption}
            onClick={() => handleToggle(classOption)}
            className={`px-4 py-2 rounded-full border-2 transition-colors font-medium text-sm ${
              selected.includes(classOption)
                ? "bg-[#E8E2F0] border-[#9B61FF] text-[#242220]"
                : "border-gray-300 text-[#353535] hover:border-gray-400"
            }`}
          >
            {classOption}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-[#353535] mb-3 font-medium">Selected classes:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((classOption) => (
              <div
                key={classOption}
                className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-sm text-[#242220]">{classOption}</span>
                <button
                  onClick={() => handleRemove(classOption)}
                  className="text-[#8C8C8C] hover:text-[#242220]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
