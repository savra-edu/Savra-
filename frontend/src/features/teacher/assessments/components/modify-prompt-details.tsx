"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Upload, Edit, Plus, Edit2, Camera, Loader2 } from "lucide-react"
import QuestionPaperContent from "./question-paper-content"
import AddTypeDialog from "./add-type-dialog"
import { ChapterSelector } from "@/features/teacher/lesson-plan/components/chapter-selector"
import { FileUploadSection } from "@/features/teacher/lesson-plan/components/file-upload-section"
import { QuizObjectiveSection } from "@/features/teacher/quiz/components/objective-section"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { uploadReferenceFile } from "@/lib/upload-reference-file"
import { useFetch } from "@/hooks/use-api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const QUESTION_PAPER_SUGGESTIONS = [
  "Make it shorter",
  "Add HOTS questions",
  "Add case-based questions",
  "Make it exam-oriented",
  "Simplify for slow learners",
  "Add more MCQs",
]

const SUGGESTED_CHAPTERS = [
  "Fractions & Decimals",
  "The Triangle & Its Properties",
  "Rational Numbers",
  "Data Handling",
  "Simple Equations2",
  "Simple Equations",
  "Exponents & Powers",
  "Algebraic Expressions",
  "Linear Equations",
  "Geometry",
  "Perimeter & Area",
  "Lines & Angles",
]

interface QuestionType {
  name: string
  numQuestions: string
  totalMarks: string
}

export default function ModifyPromptDetails() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")

  const [promptText, setPromptText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [numQuestions, setNumQuestions] = useState<string>("10")
  const [level, setLevel] = useState<string>("Easy")
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { name: "MCQ", numQuestions: "10", totalMarks: "10" },
    { name: "Short Answers", numQuestions: "10", totalMarks: "10" },
    { name: "Long Answers", numQuestions: "10", totalMarks: "10" },
    { name: "Case Study", numQuestions: "10", totalMarks: "10" },
  ])
  const [selectedBooks, setSelectedBooks] = useState<string[]>(["NCERT Textbook (default)", "XAM Ideas", "Oswald Question Bank"])
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch existing assessment data
  const { data: assessment, isLoading } = useFetch<any>(
    assessmentId ? `/assessments/${assessmentId}` : null,
    !!assessmentId
  )

  // Populate form with existing assessment data
  useEffect(() => {
    if (assessment) {
      setPromptText(assessment.objective || "Share how you'd like this question paper to be created — for example, topics to focus on, HOTS or case-based questions, or follow a CBSE exam pattern.")
      setLevel(assessment.difficultyLevel || "Easy")
      setNumQuestions(assessment.totalMarks?.toString() || "10")
      // Set chapters from assessment data
      if (assessment.chapters && assessment.chapters.length > 0) {
        setSelectedChapters(assessment.chapters.map((c: any) => c.chapter?.name || c.name))
      }
      // Set question types from assessment data
      if (assessment.questionTypes && assessment.questionTypes.length > 0) {
        setQuestionTypes(assessment.questionTypes.map((qt: any) => ({
          name: qt.questionType || qt.name,
          numQuestions: qt.numberOfQuestions?.toString() || "0",
          totalMarks: qt.marksPerQuestion?.toString() || "0",
        })))
      }
    }
  }, [assessment])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleQuestionTypeChange = (index: number, field: "numQuestions" | "totalMarks", value: string) => {
    const updated = [...questionTypes]
    updated[index][field] = clampNonNegative(value)
    setQuestionTypes(updated)
  }

  const clampNonNegative = (v: string): string => {
    if (v === '') return v
    const n = parseInt(v, 10)
    return (isNaN(n) || n < 0) ? '0' : v
  }

  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) => (prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]))
  }

  const books = ["NCERT Textbook (default)", "XAM Ideas", "All in ONE", "Oswald Question Bank"]

  const toggleBook = (book: string) => {
    if (selectedBooks.includes(book)) {
      setSelectedBooks(selectedBooks.filter((b) => b !== book))
    } else {
      setSelectedBooks([...selectedBooks, book])
    }
  }

  const handleModifyAndGenerate = async () => {
    if (!assessmentId) {
      setError("No assessment ID found")
      return
    }

    setIsRegenerating(true)
    setError(null)

    try {
      let referenceFileUrl: string | undefined
      if (uploadedFile) {
        try {
          referenceFileUrl = await uploadReferenceFile(uploadedFile)
        } catch {
          setError("Failed to upload file. Please try again.")
          setIsRegenerating(false)
          return
        }
      }

      // Calculate total marks from question types
      const calculatedTotalMarks = questionTypes.reduce((sum, qt) => {
        const num = parseInt(qt.numQuestions) || 0
        const marks = parseInt(qt.totalMarks) || 0
        return sum + (num * marks)
      }, 0)

      // Transform question types to API format
      const questionTypesForApi = questionTypes
        .filter(qt => parseInt(qt.numQuestions) > 0) // Only include types with questions
        .map(qt => ({
          questionType: qt.name.toLowerCase().replace(/\s+/g, '_'),
          numberOfQuestions: parseInt(qt.numQuestions) || 0,
          marksPerQuestion: parseInt(qt.totalMarks) || 1,
        }))

      // Step 1: Save the modified objective, question types, and other fields to the assessment
      const updatePayload: Record<string, unknown> = {
        objective: promptText || null,
        difficultyLevel: level?.toLowerCase() || undefined,
        totalMarks: calculatedTotalMarks || (numQuestions ? parseInt(numQuestions) : undefined),
        questionTypes: questionTypesForApi.length > 0 ? questionTypesForApi : undefined,
      }
      if (referenceFileUrl !== undefined) updatePayload.referenceFileUrl = referenceFileUrl
      await api.put(`/assessments/${assessmentId}`, updatePayload)

      // Step 2: Regenerate the question paper with new objective
      await api.post(`/assessments/${assessmentId}/generate`, { regenerate: true })

      // Step 3: Navigate back to assessment page with the assessment ID
      router.push(`/assessments/create/question-paper?id=${assessmentId}`)
    } catch (err) {
      console.error("Failed to regenerate assessment:", err)
      setError(err instanceof Error ? err.message : "Failed to regenerate question paper")
      setIsRegenerating(false)
    }
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
          <div className="space-y-3">
            {/* Select Chapter - Full Width */}
            <div>
              <h2 className="text-base font-bold text-[#000000] mb-4">Select Chapters</h2>
              <ChapterSelector
                chapters={SUGGESTED_CHAPTERS}
                selectedChapters={selectedChapters}
                onToggleChapter={toggleChapter}
              />
            </div>

            {/* Number of Questions and Level - Side by Side */}
            <div className="flex flex-row flex-wrap gap-8">
              <div className="max-w-[600px]">
                <h2 className="text-base font-semibold text-[#000000] mb-4">Number of Questions</h2>
                <Select value={numQuestions} onValueChange={setNumQuestions}>
                  <SelectTrigger className="w-full border-[#A56AFF]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-w-[200px]">
                <h2 className="text-base font-semibold text-[#000000] mb-4">Level:</h2>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full border-[#A56AFF]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type of Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#000000]">Type of Questions</h2>
                <button 
                  onClick={() => setIsAddTypeDialogOpen(true)}
                  className="text-[#9B61FF] font-semibold text-sm flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Add type <Plus className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-4">
                {questionTypes.map((type, index) => (
                  <div key={type.name} className="space-y-2">
                    <p className="text-base font-medium text-[#6A6A6A]">{type.name}</p>
                    <div className="flex gap-1">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#6A6A6A] mb-1">No. of Questions</label>
                        <Input
                          value={type.numQuestions}
                          onChange={(e) => handleQuestionTypeChange(index, "numQuestions", e.target.value)}
                          placeholder="0"
                          type="number"
                          min={0}
                          className="px-4 py-6 border border-[#7D5CB0] rounded-r-none text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#6A6A6A] mb-1">total marks</label>
                        <Input
                          value={type.totalMarks}
                          onChange={(e) => handleQuestionTypeChange(index, "totalMarks", e.target.value)}
                          placeholder="0"
                          type="number"
                          min={0}
                          className="px-4 py-6 border border-[#7D5CB0] rounded-l-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Books Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#000000]">Reference Books</h2>
                <button className="text-[#9B61FF] font-semibold text-sm flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                  Add book <Plus className="w-4 h-4" strokeWidth={3} />
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

            {/* Suggestions Section */}
            <div>
              <h2 className="text-base font-bold text-[#000000] mb-4">Suggestions</h2>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_PAPER_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPromptText(prev => prev ? `${prev}. ${suggestion}` : suggestion)}
                    className="px-4 py-3 bg-white border-2 border-[#4612CF87] rounded-lg text-xs font-medium hover:bg-[#EFE9F8] transition cursor-pointer text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Objective Section */}
            <div>
              <QuizObjectiveSection
                objective={promptText}
                onObjectiveChange={setPromptText}
                title="Assessment Objective"
                placeholder="Share how you'd like this question paper to be created — for example, topics to focus on, HOTS or case-based questions, or follow a CBSE exam pattern."
              />
            </div>

            {/* Upload Reference Material Section */}
            <div>
              <h3 className="text-base font-bold text-black mb-4">Upload Reference Material</h3>
              <FileUploadSection onFileUpload={handleFileUpload} uploadedFileName={uploadedFile?.name} />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-4 bg-white">
          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <Button
            onClick={handleModifyAndGenerate}
            disabled={isRegenerating || isLoading || !assessmentId}
            className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-6 rounded-xl text-base disabled:opacity-50"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Modify and Generate"
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid h-full grid-cols-[3fr_2fr] gap-8 overflow-hidden">
        {/* Left Column - Question Paper Content */}
        <div className="overflow-y-auto">
          <QuestionPaperContent />
        </div>

        {/* Right Column - Edit Prompt Sidebar */}
        <div className="bg-[#F4F4F4] rounded-3xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-200">
            <h1 className="font-bold text-2xl text-[#242220]">Edit prompt</h1>
            <button
              type="button"
              onClick={() => router.push(assessmentId ? `/assessments/create/question-paper?id=${assessmentId}` : "/assessments/create")}
              className="p-2 hover:bg-gray-300 rounded-full transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Types of Questions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-base text-[#000000]">Types of Questions</h2>
                <button 
                  onClick={() => setIsAddTypeDialogOpen(true)}
                  className="text-[#7D5CB0] font-medium text-sm flex items-center gap-1 cursor-pointer hover:text-[#6a4c99]"
                >
                  Add type <Plus className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map((type, index) => (
                  <div key={index}>
                    <span className="text-sm font-medium text-[#6A6A6A] block mb-2">{type.name}</span>
                    <div className="flex gap-1">
                      <Input
                        value={type.numQuestions}
                        onChange={(e) => handleQuestionTypeChange(index, "numQuestions", e.target.value)}
                        placeholder="Qty"
                        type="number"
                        min={0}
                        className="flex-1 px-3 py-2 border border-[#7D5CB0] rounded-lg text-sm"
                      />
                      <Input
                        value={type.totalMarks}
                        onChange={(e) => handleQuestionTypeChange(index, "totalMarks", e.target.value)}
                        placeholder="Marks"
                        type="number"
                        min={0}
                        className="flex-1 px-3 py-2 border border-[#7D5CB0] rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="flex flex-wrap flex-row items-center gap-2 ">
              {/* Reference Books */}
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">Reference Books</label>
                <Select value={selectedBooks[0] || ""} onValueChange={(value) => {
                  if (!selectedBooks.includes(value)) {
                    setSelectedBooks([...selectedBooks, value])
                  }
                }}>
                  <SelectTrigger className="w-full px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#7D5CB0]" position="popper">
                    <SelectItem value="ncert">NCERT Textbook</SelectItem>
                    <SelectItem value="xam">Xam Ideas</SelectItem>
                    <SelectItem value="allinone">All In One</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">Total Marks</label>
                <Input
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(clampNonNegative(e.target.value))}
                  placeholder="Type here"
                  type="number"
                  min={0}
                  className="px-2 py-2 border border-[#7D5CB0] rounded-lg text-sm"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">Level</label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full px-4 py-2 border border-[#7D5CB0] rounded-lg text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#7D5CB0]" position="popper">
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Intermediate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Suggestions Section */}
            <div>
              <h2 className="font-bold text-base text-[#000000] mb-4">Suggestions</h2>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_PAPER_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPromptText(prev => prev ? `${prev}. ${suggestion}` : suggestion)}
                    className="px-4 py-3 bg-white border-2 border-[#4612CF87] rounded-lg text-xs font-medium hover:bg-[#EFE9F8] transition cursor-pointer text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Modify Prompt Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center p-3 bg-[#EFE9F8] rounded-t-lg border border-[#E8E0F5]">
                <h2 className="font-bold text-base text-[#242220]">Assessment Objective</h2>
                <Edit2 className="w-5 h-5 text-[#DF6647]" />
              </div>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Share how you'd like this question paper to be created - for example, topics to focus on, HOTS or case-based questions, or follow a CBSE exam pattern."
                className="flex-1 w-full px-4 py-4 bg-white border border-[#E8E0F5] rounded-b-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7D5CB0] resize-none"
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col gap-2 p-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload-modify"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const maxSize = 10 * 1024 * 1024 // 10MB
                    if (file.size > maxSize) {
                      alert(`File size exceeds 10MB limit. Please choose a smaller file.`)
                      e.target.value = ''
                      return
                    }
                    handleFileUpload(file)
                  }
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 w-full bg-[#B595FF] text-white p-3 rounded-lg font-semibold flex text-xs items-center justify-center gap-2 cursor-pointer hover:bg-[#a07fd4] transition"
              >
                <Upload className="w-4 h-4" />
                Upload a File
              </button>
              <button
                onClick={handleModifyAndGenerate}
                disabled={isRegenerating || isLoading || !assessmentId}
                className="flex-1 bg-[#DF6647] text-white p-3 rounded-lg font-semibold text-xs hover:bg-[#c95537] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Modify & regenerate"
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Type Dialog */}
      <AddTypeDialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen} />
    </>
  )
}
