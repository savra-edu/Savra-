"use client"

import { useState } from "react"
import { Search, ChevronDown } from "lucide-react"

const ROLE_OPTIONS = ["Educator", "Teacher", "School Councillor", "School administrator", "Principal", "Vice-Principal"]

interface StepRoleSelectProps {
  onSelect: (role: string) => void
  value?: string
}

export function StepRoleSelect({ onSelect, value = "" }: StepRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const [selected, setSelected] = useState(value)

  const filtered = ROLE_OPTIONS.filter((role) => role.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (role: string) => {
    setSelected(role)
    setSearch(role)
    setIsOpen(false)
    onSelect(role)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Role"
          className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DF6647]/20 text-[#242220] transition-colors ${
            isOpen ? 'border-[#DF6647] bg-gray-50' : 'border-gray-300'
          }`}
        />
        <button onClick={() => setIsOpen(!isOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#DF6647] rounded-lg shadow-lg z-10">
          {filtered.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSelect(role)}
                  className="w-full px-4 py-3 text-left hover:bg-[#DF6647]/5 text-[#242220] border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                >
                  <span>{role}</span>
                  {selected === role && (
                    <svg className="w-5 h-5 text-[#DF6647]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-[#8C8C8C]">No roles found</div>
          )}
        </div>
      )}
    </div>
  )
}
