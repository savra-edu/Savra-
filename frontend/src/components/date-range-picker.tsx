"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"

interface DateRangePickerProps {
  startDate?: string | null
  endDate?: string | null
  onChange: (startDate: string | null, endDate: string | null) => void
  className?: string
}

export function DateRangePicker({ startDate, endDate, onChange, className }: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState<string>(startDate || "")
  const [localEndDate, setLocalEndDate] = useState<string>(endDate || "")

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    setLocalStartDate(e.target.value)
    onChange(value, localEndDate || null)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    setLocalEndDate(e.target.value)
    onChange(localStartDate || null, value)
  }

  // Format date for display: "2nd Dec'25"
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear().toString().slice(-2)
      
      // Get ordinal suffix
      const ordinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
      }
      
      return `${ordinal(day)} ${month}'${year}`
    } catch {
      return dateString
    }
  }

  const displayValue = startDate && endDate 
    ? `${formatDateForDisplay(startDate)} – ${formatDateForDisplay(endDate)}`
    : ""

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={localStartDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B61FF] focus:border-transparent"
          />
        </div>
        <span className="text-gray-400 mt-6">–</span>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={localEndDate}
            onChange={handleEndDateChange}
            min={localStartDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B61FF] focus:border-transparent"
          />
        </div>
      </div>
      {displayValue && (
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Date:</span> {displayValue}
        </div>
      )}
    </div>
  )
}
