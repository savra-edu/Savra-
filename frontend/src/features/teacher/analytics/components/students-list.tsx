"use client"

import { useFetch } from "@/hooks/use-api"

interface StudentPerformance {
  id: string
  name: string
  score: number
  status: "Good" | "Needs Attention"
  trend: string
}

interface StudentsListProps {
  quizId: string | null
}

// Placeholder students data
const PLACEHOLDER_STUDENTS: StudentPerformance[] = [
  { id: "1", name: "Rahul Kumar", score: 95, status: "Good", trend: "↑ 5%" },
  { id: "2", name: "Priya Sharma", score: 90, status: "Good", trend: "↑ 3%" },
  { id: "3", name: "Amit Singh", score: 88, status: "Good", trend: "↑ 2%" },
  { id: "4", name: "Neha Gupta", score: 85, status: "Good", trend: "→" },
  { id: "5", name: "Vikram Patel", score: 82, status: "Good", trend: "↑ 1%" },
  { id: "6", name: "Aarav Jain", score: 78, status: "Good", trend: "→" },
  { id: "7", name: "Ananya Reddy", score: 72, status: "Needs Attention", trend: "↓ 2%" },
  { id: "8", name: "Rohan Mehta", score: 68, status: "Needs Attention", trend: "↓ 5%" },
]

export function StudentsList({ quizId }: StudentsListProps) {
  const { data: students, isLoading } = useFetch<StudentPerformance[]>(
    quizId ? `/teacher/analytics/quiz/${quizId}/students` : null
  )
  
  const finalStudents = (students && students.length > 0) ? students : PLACEHOLDER_STUDENTS

  return (
    <div className="space-y-4 bg-[#FDFBFE] p-4 lg:p-6 rounded-lg border border-[#F0EAFA]">
      <div className="rounded-lg overflow-y-auto">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b flex justify-between items-center text-xs lg:text-sm font-medium text-[#353535]">
          <span>Student Name</span>
          <span>Score %</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && finalStudents && finalStudents.length > 0 && (
          <div className="divide-y">
            {finalStudents.map((student) => (
              <div key={student.id} className="px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                  <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                  <span className="font-medium text-sm lg:text-base truncate">{student.name}</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                  <span className="font-semibold text-sm lg:text-base">{student.score}%</span>
                  <span
                    className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap ${
                      student.status === "Good" ? "bg-[#FEFBFE] text-green-700" : "bg-[#FDF2DE] text-amber-700"
                    }`}
                  >
                    {student.status}
                  </span>
                  <span className="text-xs lg:text-sm text-[#353535] whitespace-nowrap">{student.trend}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
