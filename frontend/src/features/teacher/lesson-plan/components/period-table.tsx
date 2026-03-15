"use client"

import { Trash2 } from "lucide-react"
import { LessonPeriod } from "@/types/api"

const ALL_COLUMNS = [
  { key: "periodNo" as const, header: "Period\nNo", width: "w-20", deletable: false },
  { key: "concept" as const, header: "Concept", width: "w-32", deletable: true },
  { key: "learningOutcomes" as const, header: "Learning\nOutcomes\n(Competency\nBased)", width: "w-40", deletable: true },
  { key: "teacherLearningProcess" as const, header: "Teacher-\nLearning\nProcess", width: "w-40", deletable: true },
  { key: "assessment" as const, header: "Assessment", width: "w-32", deletable: true },
  { key: "resources" as const, header: "Resources", width: "w-32", deletable: true },
  { key: "centurySkillsValueEducation" as const, header: "21st\nCentury\nSkills/Value\nEducation", width: "w-40", deletable: true },
  { key: "realLifeApplication" as const, header: "Real\nLife\nApplication", width: "w-32", deletable: true },
  { key: "reflection" as const, header: "Reflection", width: "w-32", deletable: true },
]

interface PeriodTableProps {
  periods: LessonPeriod[]
  onPeriodChange?: (periods: LessonPeriod[]) => void
  readOnly?: boolean
  /** Column keys to hide (e.g. removed by user). Period No is never hidden. */
  hiddenColumnKeys?: string[]
  /** When set, shows delete control on each deletable column header. Called with the column key when user removes the column. */
  onRemoveColumn?: (columnKey: string) => void
}

export function PeriodTable({
  periods,
  onPeriodChange,
  readOnly = false,
  hiddenColumnKeys = [],
  onRemoveColumn,
}: PeriodTableProps) {
  const columns = ALL_COLUMNS.filter((col) => col.key === "periodNo" || !hiddenColumnKeys.includes(col.key))

  const handleCellChange = (periodIndex: number, field: keyof LessonPeriod, value: string) => {
    if (readOnly || !onPeriodChange) return

    const updatedPeriods = [...periods]
    updatedPeriods[periodIndex] = {
      ...updatedPeriods[periodIndex],
      [field]: value || undefined,
    }
    onPeriodChange(updatedPeriods)
  }

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.width} px-2 py-3 text-left font-semibold text-gray-900 border-r border-gray-300 last:border-r-0 relative group`}
              >
                <div className="whitespace-pre-line text-xs leading-tight pr-6">{col.header}</div>
                {col.deletable && onRemoveColumn && (
                  <button
                    type="button"
                    onClick={() => onRemoveColumn(col.key)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Remove this column from the lesson plan"
                    aria-label={`Remove ${col.header.replace(/\n/g, " ")} column`}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                No periods added yet
              </td>
            </tr>
          ) : (
            periods.map((period, index) => (
              <tr key={period.id || `period-${period.periodNo}-${index}`} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                {columns.map((col) => {
                  const fieldKey = col.key
                  const value = fieldKey === "periodNo" ? String(period.periodNo) : (period[fieldKey as keyof LessonPeriod] as string) || ""

                  if (fieldKey === "periodNo") {
                    return (
                      <td key={fieldKey} className="px-2 py-3 text-center font-medium border-r border-gray-300">
                        {period.periodNo}
                      </td>
                    )
                  }

                  return (
                    <td key={fieldKey} className="px-2 py-2 border-r border-gray-300 last:border-r-0">
                      {readOnly ? (
                        <div className="min-h-[60px] text-gray-700 whitespace-pre-wrap break-words">
                          {value || "-"}
                        </div>
                      ) : (
                        <textarea
                          value={value}
                          onChange={(e) => handleCellChange(index, fieldKey as keyof LessonPeriod, e.target.value)}
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
