"use client"

import { LessonPeriod } from "@/types/api"

interface PeriodTableProps {
  periods: LessonPeriod[]
  onPeriodChange?: (periods: LessonPeriod[]) => void
  readOnly?: boolean
}

export function PeriodTable({ periods, onPeriodChange, readOnly = false }: PeriodTableProps) {
  const handleCellChange = (periodIndex: number, field: keyof LessonPeriod, value: string) => {
    if (readOnly || !onPeriodChange) return

    const updatedPeriods = [...periods]
    updatedPeriods[periodIndex] = {
      ...updatedPeriods[periodIndex],
      [field]: value || undefined,
    }
    onPeriodChange(updatedPeriods)
  }

  const columns = [
    { key: "periodNo" as const, header: "Period\nNo", width: "w-20" },
    { key: "concept" as const, header: "Concept", width: "w-32" },
    { key: "learningOutcomes" as const, header: "Learning\nOutcomes\n(Competency\nBased)", width: "w-40" },
    { key: "teacherLearningProcess" as const, header: "Teacher-\nLearning\nProcess", width: "w-40" },
    { key: "assessment" as const, header: "Assessment", width: "w-32" },
    { key: "resources" as const, header: "Resources", width: "w-32" },
    { key: "centurySkillsValueEducation" as const, header: "21st\nCentury\nSkills/Value\nEducation", width: "w-40" },
    { key: "realLifeApplication" as const, header: "Real\nLife\nApplication", width: "w-32" },
    { key: "reflection" as const, header: "Reflection", width: "w-32" },
  ]

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.width} px-2 py-3 text-left font-semibold text-gray-900 border-r border-gray-300 last:border-r-0`}
              >
                <div className="whitespace-pre-line text-xs leading-tight">{col.header}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                No periods added yet
              </td>
            </tr>
          ) : (
            periods.map((period, index) => (
              <tr key={period.id || `period-${period.periodNo}-${index}`} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                <td className="px-2 py-3 text-center font-medium border-r border-gray-300">
                  {period.periodNo}
                </td>
                {columns.slice(1).map((col) => {
                  const fieldKey = col.key
                  const value = period[fieldKey] || ""
                  
                  return (
                    <td key={fieldKey} className="px-2 py-2 border-r border-gray-300 last:border-r-0">
                      {readOnly ? (
                        <div className="min-h-[60px] text-gray-700 whitespace-pre-wrap break-words">
                          {value || "-"}
                        </div>
                      ) : (
                        <textarea
                          value={value}
                          onChange={(e) => handleCellChange(index, fieldKey, e.target.value)}
                          className="w-full min-h-[60px] px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B61FF] focus:border-[#9B61FF] resize-none"
                          placeholder="Enter text..."
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
