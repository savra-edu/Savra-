"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAdminStudent } from "@/hooks/use-admin"
import { Loader2, BarChart3, Award, BookOpen, Trophy } from "lucide-react"

interface StudentAnalyticsDialogProps {
  studentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  classRank?: { rank: number; totalInClass: number }
}

export function StudentAnalyticsDialog({
  studentId,
  open,
  onOpenChange,
  classRank,
}: StudentAnalyticsDialogProps) {
  const { data: student, isLoading, error } = useAdminStudent(
    open && studentId ? studentId : null
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#353535]">
            Student Analytics
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#DF6647]" />
            <p className="mt-3 text-sm text-gray-500">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && !error && student && (
          <div className="space-y-6">
            {/* Student info */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
              <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-800">
                  {student.name?.charAt(0) || "S"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#353535] truncate">{student.name}</p>
                <p className="text-sm text-gray-500 truncate">{student.email}</p>
                {student.rollNumber != null && (
                  <p className="text-xs text-gray-400">Roll: {student.rollNumber}</p>
                )}
                {student.class && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {student.class.name || `Grade ${student.class.grade}${student.class.section}`}
                  </p>
                )}
              </div>
            </div>

            {/* Class rank (by totalPoints) */}
            {classRank && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Trophy className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Class rank: #{classRank.rank} of {classRank.totalInClass}
                  </p>
                  <p className="text-xs text-blue-600">By points earned</p>
                </div>
              </div>
            )}

            {/* Quiz performance summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#353535] flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Quiz Performance
              </h4>
              {student.quizPerformance ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg border bg-white">
                    <p className="text-xs text-gray-500">Total Attempts</p>
                    <p className="text-2xl font-bold text-[#353535]">
                      {student.quizPerformance.totalAttempts}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <p className="text-xs text-gray-500">Average Score</p>
                    <p className="text-2xl font-bold text-[#353535]">
                      {student.quizPerformance.averageScore?.toFixed(1) ?? "0"}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-2">No quiz attempts yet</p>
              )}
            </div>

            {/* Total points (if available) */}
            {student.totalPoints != null && student.totalPoints > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {student.totalPoints} points earned
                </span>
              </div>
            )}

            {/* Recent attempts */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#353535] flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Recent Quiz Attempts
              </h4>
              {student.quizPerformance?.recentAttempts &&
              student.quizPerformance.recentAttempts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {student.quizPerformance.recentAttempts.map((attempt) => {
                    const pct =
                      attempt.totalMarks && attempt.totalMarks > 0
                        ? Math.round(((attempt.score ?? 0) / attempt.totalMarks) * 100)
                        : 0
                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white text-sm"
                      >
                        <span className="font-medium truncate flex-1 mr-2">
                          {attempt.quizTitle}
                        </span>
                        <span className="font-semibold text-[#353535] shrink-0">
                          {attempt.score ?? 0}/{attempt.totalMarks ?? 0} ({pct}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-2">No recent attempts</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
