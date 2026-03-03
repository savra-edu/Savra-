"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface SortDropdownProps {
  label: string
  options: string[]
  selected: string
  onSelect: (option: string) => void
}

export function SortDropdown({ label, options, selected, onSelect }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-900 font-medium hover:text-gray-600 transition"
      >
        {label}: {selected}
        <ChevronDown size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                selected === option ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
