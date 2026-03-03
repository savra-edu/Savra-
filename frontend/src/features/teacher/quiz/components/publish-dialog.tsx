"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { api } from "@/lib/api"
import { useTeacherClasses } from "@/hooks/use-classes"

interface QuizClass {
  id: string
  name: string
  grade: number
  section: string
}

interface PublishDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  quizId?: string | null
  onPublish?: () => void
}

export default function PublishDialog({ open: controlledOpen, onOpenChange, children, quizId, onPublish }: PublishDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [hour, setHour] = useState("")
  const [amPm, setAmPm] = useState<string>("")
  const [coins, setCoins] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch teacher's classes
  const { data: teacherClasses } = useTeacherClasses()

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Get all teacher's classes - show ALL classes regardless of quiz grade
  const sections = useMemo(() => {
    if (!teacherClasses) return []

    return teacherClasses.map((cls: QuizClass) => ({
      id: cls.id,
      display: `${cls.grade}th-${cls.section}`,
      value: `${cls.grade}-${cls.section}`
    }))
  }, [teacherClasses])

  // Set default values and reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedSections([])
      setError(null)
      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDay(tomorrow.getDate().toString())
      setMonth((tomorrow.getMonth() + 1).toString())
      setYear(tomorrow.getFullYear().toString())
      setHour("10")
      setAmPm("AM")
      setCoins("")
    }
  }, [open])

  // Validate and constrain day input (1-31)
  const handleDayChange = (value: string) => {
    const num = parseInt(value)
    if (value === "" || (num >= 1 && num <= 31)) {
      setDay(value)
    }
  }

  // Validate and constrain month input (1-12)
  const handleMonthChange = (value: string) => {
    const num = parseInt(value)
    if (value === "" || (num >= 1 && num <= 12)) {
      setMonth(value)
    }
  }

  // Validate year input (current year or later)
  const handleYearChange = (value: string) => {
    const currentYear = new Date().getFullYear()
    const num = parseInt(value)
    if (value === "" || value.length <= 4) {
      if (value === "" || (num >= currentYear && num <= currentYear + 10)) {
        setYear(value)
      } else if (value.length < 4) {
        // Allow partial input while typing
        setYear(value)
      }
    }
  }

  // Validate hour input (1-12)
  const handleHourChange = (value: string) => {
    const num = parseInt(value)
    if (value === "" || (num >= 1 && num <= 12)) {
      setHour(value)
    }
  }

  // Validate that deadline is in the future
  const isDeadlineValid = () => {
    if (!day || !month || !year || !hour || !amPm) return false

    const hourNum = parseInt(hour) || 12
    const adjustedHour = amPm === "PM" && hourNum !== 12 ? hourNum + 12 : (amPm === "AM" && hourNum === 12 ? 0 : hourNum)
    const deadline = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), adjustedHour)

    return deadline > new Date()
  }

  const handleSelectSection = (section: string) => {
    setSelectedSections((prev) => {
      if (prev.includes(section)) {
        // Deselect if already selected
        return prev.filter((s) => s !== section)
      } else {
        // Select if not selected
        return [...prev, section]
      }
    })
  }

  const handleSaveDraft = async () => {
    if (!quizId) return

    setIsLoading(true)
    setError(null)

    try {
      await api.patch(`/quizzes/${quizId}/status`, { status: "draft" })
      setOpen(false)
      onPublish?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (selectedSections.length === 0 || !quizId) return

    // Validate deadline is in the future
    if (!isDeadlineValid()) {
      setError("Please set a valid deadline in the future")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build due date
      const hourNum = parseInt(hour) || 12
      const adjustedHour = amPm === "PM" && hourNum !== 12 ? hourNum + 12 : (amPm === "AM" && hourNum === 12 ? 0 : hourNum)
      const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), adjustedHour).toISOString()

      // Publish quiz
      await api.patch(`/quizzes/${quizId}/status`, {
        status: "published",
        sections: selectedSections,
        dueDate,
        coins: coins ? parseInt(coins) : undefined
      })

      setOpen(false)
      onPublish?.()

      // Reset form
      setSelectedSections([])
      setDay("")
      setMonth("")
      setYear("")
      setHour("")
      setAmPm("")
      setCoins("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish quiz")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl h-[70vh] max-w-[calc(100%-2rem)]" showCloseButton={false}>
        <DialogHeader className="text-left">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-2xl font-medium mb-1">Create A Quiz</p>
              <DialogTitle className="text-2xl font-bold text-center">
                Publish
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <button className="p-2 hover:bg-gray-200 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Select Sections Section */}
          <div className="w-full flex flex-col justify-center items-center gap-2">
            <label className="block text-sm font-medium text-[#000000] mb-3">Select Sections</label>
            {sections.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {!teacherClasses ? "Loading classes..." : "No classes available"}
              </p>
            ) : (
              <div className="flex flex-row flex-wrap gap-3 justify-center">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    onClick={() => handleSelectSection(section.value)}
                    variant="outline"
                    className={`px-8 w-[180px] py-1 h-auto text-sm font-medium transition-colors ${
                      selectedSections.includes(section.value)
                        ? "bg-[#EFE9F8] border border-[#4612CF87] hover:bg-[#EFE9F8] text-gray-900"
                        : "bg-white border border-[#4612CF87] text-gray-900 hover:bg-[#EFE9F8]"
                    }`}
                  >
                    {section.display}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Due date Section */}
          <div className="w-full flex flex-row justify-center items-center gap-6 mt-6">

            <div>
                <label className="block text-sm font-medium text-[#000000] mb-3">Due date</label>
                <div className="flex flex-row gap-1">
                <Input
                    value={day}
                    onChange={(e) => handleDayChange(e.target.value)}
                    placeholder="DD"
                    type="number"
                    min={1}
                    max={31}
                    className="px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm w-20"
                />
                <Input
                    value={month}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    placeholder="MM"
                    type="number"
                    min={1}
                    max={12}
                    className="px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm w-20"
                />
                <Input
                    value={year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    placeholder="YYYY"
                    type="number"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                    className="px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm w-24"
                />
                </div>
            </div>

            {/* Time Section */}
            <div>
                <label className="block text-sm font-medium text-[#000000] mb-3">Time</label>
                <div className="flex flex-row gap-1">
                <Input
                    value={hour}
                    onChange={(e) => handleHourChange(e.target.value)}
                    placeholder="HH"
                    type="number"
                    min={1}
                    max={12}
                    className="px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm w-20"
                />
                <Select value={amPm} onValueChange={setAmPm}>
                    <SelectTrigger className="w-24 px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm">
                    <SelectValue placeholder="AM" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#7D5CB0]">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
          </div>

          {/* Coins Section */}
          <div className="flex w-[150px] mx-auto flex-col justify-center items-center mt-6">
            <label className="block text-sm font-medium text-[#000000] mb-3">Coins</label>
            <Input
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              placeholder="Type here"
              type="number"
              className="px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleSaveDraft}
              disabled={isLoading}
              variant="outline"
              className="px-6 py-2 border border-[#DF6647] text-[#DF6647] bg-white hover:bg-[#DF6647]/10 font-semibold disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={selectedSections.length === 0 || isLoading}
              className={`px-6 py-2 font-semibold ${
                selectedSections.length > 0 && !isLoading
                  ? "bg-[#DF6647] text-[#FFFFF] text-white hover:bg-[#DF6647]/90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
