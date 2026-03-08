"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit2, ChevronDown, X } from "lucide-react"
import AddTypeDialog from "./add-type-dialog"
import { FileUploadSection } from "@/features/teacher/lesson-plan/components/file-upload-section"
import { GeneratingOverlay } from "@/components/generating-overlay"
import { api } from "@/lib/api"
import { useChapters } from "@/hooks/use-chapters"

interface Chapter {
  id: string
  name: string
}

interface QuestionType {
  name: string
  numQuestions: string
  marksPerQuestion: string
}

interface Assessment {
  id: string
  title: string
  status: string
}

interface QuestionPaperFormProps {
  selectedClassId: string
  selectedSubjectId: string
}

const QUESTION_TYPE_DISPLAY_NAMES: Record<string, string> = {
  mcq: "MCQs",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  case_study: "Case study",
  fill_in_blanks: "Fill In The Blanks",
  problem_solving: "Problem Solving",
  diagram_based: "Diagram Based",
}

export default function QuestionPaperForm({ selectedClassId, selectedSubjectId }: QuestionPaperFormProps) {
  const router = useRouter()

  // Chapters - load based on selected subject
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters(selectedSubjectId || undefined)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false)
  const chapterDropdownRef = useRef<HTMLDivElement>(null)

  const [totalMarks, setTotalMarks] = useState<string>("")
  const [difficultyLevel, setDifficultyLevel] = useState<string>("")
  const [selectedBooks, setSelectedBooks] = useState<string[]>(["NCERT Textbook (Default)", "XAM Ideas", "All in ONE"])
  const [objective, setObjective] = useState("")
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { name: "mcq", numQuestions: "0", marksPerQuestion: "1" },
    { name: "short_answer", numQuestions: "0", marksPerQuestion: "2" },
    { name: "long_answer", numQuestions: "0", marksPerQuestion: "5" },
    { name: "case_study", numQuestions: "0", marksPerQuestion: "4" },
  ])

  // Reset chapters when subject changes
  useEffect(() => {
    setSelectedChapterIds([])
  }, [selectedSubjectId])

  // Close chapter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(e.target as Node)) {
        setChapterDropdownOpen(false)
      }
    }
    if (chapterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [chapterDropdownOpen])

  // Form validation (Question Paper Objective is optional)
  const isFormValid = useMemo(() => {
    return selectedClassId !== "" &&
           selectedSubjectId !== "" &&
           selectedChapterIds.length > 0 &&
           totalMarks !== ""
  }, [selectedClassId, selectedSubjectId, selectedChapterIds, totalMarks])

  const clampNonNegative = (v: string): string => {
    if (v === '') return v
    const n = parseInt(v, 10)
    return (isNaN(n) || n < 0) ? '0' : v
  }

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((c) => c !== chapterId) : [...prev, chapterId]
    )
  }

  const selectedChapterNames = chaptersData
    ?.filter((ch: Chapter) => selectedChapterIds.includes(ch.id))
    .map((ch: Chapter) => ch.name) || []

  const handleGenerate = async () => {
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    try {
      // Upload file if present
      let referenceFileUrl: string | undefined
      if (uploadedFile) {
        try {
          const formData = new FormData()
          formData.append("file", uploadedFile)
          const uploadResult = await api.upload<{ success: boolean; data: { url: string } }>("/upload/file", formData)
          if (uploadResult.success && uploadResult.data?.url) {
            referenceFileUrl = uploadResult.data.url
            console.log('File uploaded successfully:', referenceFileUrl)
          } else {
            console.warn('Upload response missing URL:', uploadResult)
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError)
          setError('Failed to upload file. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Create assessment with correct field names
      const assessmentData = {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        chapterIds: selectedChapterIds,
        title: selectedChapterNames.join(", ") || "Assessment",
        totalMarks: parseInt(totalMarks) || 100,
        difficultyLevel: (difficultyLevel || "medium").toLowerCase() as "easy" | "medium" | "hard",
        questionTypes: questionTypes
          .filter(qt => parseInt(qt.numQuestions) > 0)
          .map(qt => ({
            questionType: qt.name,
            numberOfQuestions: parseInt(qt.numQuestions) || 0,
            marksPerQuestion: parseInt(qt.marksPerQuestion) || 1
          })),
        referenceBooks: selectedBooks,
        objective: objective.trim() || undefined,
        referenceFileUrl,
      }

      const response = await api.post<{ success: boolean; data: Assessment }>("/assessments", assessmentData)
      const assessment = response.data

      // Generate questions
      await api.post(`/assessments/${assessment.id}/generate`, {})

      // Navigate to generated assessment page
      router.push(`/assessments/create/question-paper?id=${assessment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate assessment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleQuestionTypeChange = (index: number, field: "numQuestions" | "marksPerQuestion", value: string) => {
    const updated = [...questionTypes]
    updated[index][field] = clampNonNegative(value)
    setQuestionTypes(updated)
  }

  const removeQuestionType = (index: number) => {
    setQuestionTypes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddQuestionTypes = (typeNames: string[]) => {
    const dialogToInternal: Record<string, string> = {
      "Diagram-Based Questions": "diagram_based",
      "Fill in the Blanks": "fill_in_blanks",
      "Numerical / Problem Solving": "problem_solving",
    }
    const existingNames = new Set(questionTypes.map(qt => qt.name))
    const newTypes: QuestionType[] = []
    for (const displayName of typeNames) {
      const internal = dialogToInternal[displayName]
      if (internal && !existingNames.has(internal)) {
        newTypes.push({ name: internal, numQuestions: "0", marksPerQuestion: "1" })
      }
    }
    if (newTypes.length > 0) {
      setQuestionTypes(prev => [...prev, ...newTypes])
    }
  }

  const books = ["NCERT Textbook (Default)", "XAM Ideas", "All in ONE", "Oswald Question Bank"]

  const toggleBook = (book: string) => {
    if (selectedBooks.includes(book)) {
      setSelectedBooks(selectedBooks.filter((b) => b !== book))
    } else {
      setSelectedBooks([...selectedBooks, book])
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {isLoading && <GeneratingOverlay type="assessment" onCancel={() => setIsLoading(false)} />}
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
        {/* Row: Chapters + Total Marks + Level */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Chapter dropdown */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <label className="text-base font-bold text-[#000000]">Select the chapter(s)</label>
            <div ref={chapterDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (selectedSubjectId && !chaptersLoading) setChapterDropdownOpen(prev => !prev)
                }}
                className="w-full flex items-center justify-between px-4 py-3 border border-[#A56AFF] rounded-lg bg-white text-left text-sm"
              >
                <span className={`truncate ${selectedChapterNames.length > 0 ? "text-[#242220]" : "text-gray-400"}`}>
                  {!selectedSubjectId
                    ? "Select a subject first"
                    : chaptersLoading
                    ? "Loading..."
                    : selectedChapterNames.length > 0
                    ? selectedChapterNames.join(", ")
                    : "Select"}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-500 shrink-0 ml-2" />
              </button>
              {chapterDropdownOpen && chaptersData && chaptersData.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {chaptersData.map((chapter: Chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        selectedChapterIds.includes(chapter.id)
                          ? "bg-[#EFE9F8] text-[#9B61FF] font-medium"
                          : "text-[#242220]"
                      }`}
                    >
                      {chapter.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Total Marks */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-[#000000]">Total Marks</label>
            <Input
              value={totalMarks}
              onChange={(e) => setTotalMarks(clampNonNegative(e.target.value))}
              placeholder="Type here"
              type="number"
              min={0}
              className="w-full lg:w-[140px] px-4 py-3 border border-[#A56AFF] rounded-lg [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
            />
          </div>

          {/* Level */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-[#000000]">Level</label>
            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger className="w-full lg:w-[140px] border-[#A56AFF]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Intermediate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Types of Questions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#000000]">Types of Questions</h2>
            <button
              onClick={() => setIsAddTypeDialogOpen(true)}
              className="text-[#9B61FF] font-semibold text-sm flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Add type <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {questionTypes.map((type, index) => (
              <div key={type.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#000000]">
                    {QUESTION_TYPE_DISPLAY_NAMES[type.name] || type.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeQuestionType(index)}
                    className="p-0.5 rounded-full border border-red-600 hover:border-red-600 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${QUESTION_TYPE_DISPLAY_NAMES[type.name] || type.name}`}
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <Input
                    value={type.numQuestions}
                    onChange={(e) => handleQuestionTypeChange(index, "numQuestions", e.target.value)}
                    placeholder="No of Ques"
                    type="number"
                    min={0}
                    className="flex-1 min-w-0 px-2 py-2 border border-[#7D5CB0] rounded-lg text-xs [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                  />
                  <Input
                    value={type.marksPerQuestion}
                    onChange={(e) => handleQuestionTypeChange(index, "marksPerQuestion", e.target.value)}
                    placeholder="Total Marks"
                    type="number"
                    min={0}
                    className="flex-1 min-w-0 px-2 py-2 border border-[#7D5CB0] rounded-lg text-xs [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Books Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#000000]">Reference Books</h2>
            <button className="text-[#9B61FF] font-semibold text-sm flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
              Add Books <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {books.map((book) => (
              <Button
                key={book}
                onClick={() => toggleBook(book)}
                variant={selectedBooks.includes(book) ? "default" : "outline"}
                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  selectedBooks.includes(book)
                    ? "border border-[#4612CF87] text-black bg-[#E9DBFF] hover:bg-[#E9DBFF]"
                    : "bg-white border border-[#4612CF87] text-black hover:bg-[#F5F0FA]"
                }`}
              >
                {book}
              </Button>
            ))}
          </div>
        </div>

        {/* Question Paper Objective Section */}
        <div className="mb-6">
          <div className="bg-[#EFE9F8] rounded-t-lg px-6 py-4 flex items-center justify-between border border-[#F6F6F9]">
            <h3 className="text-base font-bold text-[#000000]">Question Paper Objective</h3>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Share how you'd like this question paper to be created — for example, topics to focus on, HOTS or case-based questions, or follow a CBSE exam pattern."
            className="w-full px-6 py-4 border-t-0 text-sm rounded-b-lg border border-[#DCDCDC]"
            rows={4}
          />
        </div>

        {/* Upload Reference Material Section */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-black mb-4">Upload Reference Material</h3>
          <FileUploadSection onFileUpload={handleFileUpload} uploadedFileName={uploadedFile?.name} />
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="shrink-0 border-t border-gray-200 pt-4 lg:pt-6 mt-4 bg-white">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center lg:justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || isLoading}
            className={`w-full lg:w-auto px-8 py-4 lg:py-6 rounded-xl font-semibold text-white transition-all ${
              isFormValid && !isLoading
                ? "bg-[#DF6647] hover:bg-[#FF5A35] shadow-lg hover:shadow-xl cursor-pointer"
                : "bg-[#B5B5B5] opacity-60 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <AddTypeDialog
        open={isAddTypeDialogOpen}
        onOpenChange={setIsAddTypeDialogOpen}
        onAdd={handleAddQuestionTypes}
        existingTypes={questionTypes.map(qt => qt.name)}
      />
    </div>
  )
}
