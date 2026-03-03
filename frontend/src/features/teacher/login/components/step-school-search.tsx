"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

// Fallback schools in case API fails
const FALLBACK_SCHOOLS = [
  { id: "1", name: "Army Public School, Delhi Cantt, Delhi" },
  { id: "2", name: "Army Public School, Dhaula Kuan, Delhi" },
  { id: "3", name: "Army Public School, Pathankot, Punjab" },
  { id: "4", name: "Army Public School, Kirkee, Pune" },
  { id: "5", name: "Delhi Public School, New Delhi" },
  { id: "6", name: "St. Xavier's School, Mumbai" },
]

interface School {
  id: string
  name: string
}

interface StepSchoolSearchProps {
  onSelect: (school: string) => void
  value?: string
}

export function StepSchoolSearch({ onSelect, value = "" }: StepSchoolSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const [selected, setSelected] = useState(value)
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Debounced search function
  const searchSchools = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSchools([])
      return
    }

    setIsLoading(true)
    try {
      const results = await api.get<School[]>(`/schools/search?q=${encodeURIComponent(query)}`)
      setSchools(results)
      setUseFallback(false)
    } catch {
      // Fall back to local filtering
      setUseFallback(true)
      const filtered = FALLBACK_SCHOOLS.filter((school) =>
        school.name.toLowerCase().includes(query.toLowerCase())
      )
      setSchools(filtered)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search && search !== selected) {
        searchSchools(search)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, selected, searchSchools])

  // Initial load - show fallback schools
  useEffect(() => {
    if (!search) {
      setSchools(FALLBACK_SCHOOLS)
      setUseFallback(true)
    }
  }, [search])

  const handleSelect = (school: School) => {
    setSelected(school.name)
    setSearch(school.name)
    setIsOpen(false)
    onSelect(school.name)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    setIsOpen(true)
  }

  const displaySchools = useFallback && !search
    ? FALLBACK_SCHOOLS
    : schools

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search school..."
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 text-[#242220] transition-colors"
        />
        <button onClick={() => setIsOpen(!isOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#DF6647] rounded-lg shadow-lg z-10">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displaySchools.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {displaySchools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => handleSelect(school)}
                  className="w-full px-4 py-3 text-left hover:bg-[#DF6647]/5 text-[#242220] border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  {school.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-[#8C8C8C]">No schools found</div>
          )}
        </div>
      )}
    </div>
  )
}
