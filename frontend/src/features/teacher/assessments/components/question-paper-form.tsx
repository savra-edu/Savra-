"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Plus, Edit2 } from "lucide-react"
import AddTypeDialog from "./add-type-dialog"
import { FileUploadSection } from "@/features/teacher/lesson-plan/components/file-upload-section"
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

export default function QuestionPaperForm({ selectedClassId, selectedSubjectId }: QuestionPaperFormProps) {
  const router = useRouter()

  // Chapters - load based on selected subject
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters(selectedSubjectId || undefined)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])

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

  // Form validation
  const isFormValid = useMemo(() => {
    return selectedClassId !== "" &&
           selectedSubjectId !== "" &&
           selectedChapterIds.length > 0 &&
           totalMarks !== "" &&
           objective.trim() !== ""
  }, [selectedClassId, selectedSubjectId, selectedChapterIds, totalMarks, objective])

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((c) => c !== chapterId) : [...prev, chapterId]
    )
  }

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

      // Get chapter names for title
      const selectedChapterNames = chaptersData
        ?.filter((ch: Chapter) => selectedChapterIds.includes(ch.id))
        .map((ch: Chapter) => ch.name) || []

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
        objective,
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
    updated[index][field] = value
    setQuestionTypes(updated)
  }

  const books = ["NCERT Textbook (Default)", "XAM Ideas", "All in ONE", "Oswald Question Bank"]

  const toggleBook = (book: string) => {
    if (selectedBooks.includes(book)) {
      setSelectedBooks(selectedBooks.filter((b) => b !== book))
    } else {
      setSelectedBooks([...selectedBooks, book])
    }
  }

  // Display names for question types
  const questionTypeDisplayNames: Record<string, string> = {
    mcq: "MCQ",
    short_answer: "Short Answers",
    long_answer: "Long Answers",
    case_study: "Case Study"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
        {/* Chapters Section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-base font-bold text-[#000000] mb-4">Select Chapters</h2>
          {!selectedSubjectId ? (
            <p className="text-gray-500 text-sm">Please select a subject from the header</p>
          ) : chaptersLoading ? (
            <div className="w-6 h-6 border-2 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
          ) : chaptersData && chaptersData.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chaptersData.map((chapter: Chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => toggleChapter(chapter.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-colors font-medium text-sm ${
                    selectedChapterIds.includes(chapter.id)
                      ? "bg-[#E8E2F0] border-[#9B61FF] text-[#242220]"
                      : "border-gray-300 text-[#353535] hover:border-gray-400"
                  }`}
                >
                  {chapter.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No chapters found for this subject</p>
          )}
        </div>

        {/* Total Marks and Level */}
        <div className="flex flex-row flex-wrap gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#000000]">Total Marks</label>
            <Input
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="Enter total marks"
              type="number"
              className="w-[150px] px-4 py-3 border border-[#A56AFF] rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#000000]">Difficulty Level</label>
            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger className="w-[150px] border-[#A56AFF]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Type of Questions Section */}
        <div className="mb-6">
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
                <p className="text-base font-medium text-[#6A6A6A]">{questionTypeDisplayNames[type.name] || type.name}</p>
                <div className="flex gap-1">
                  <div className="flex-1 max-w-[150px]">
                    <label className="block text-sm font-medium text-[#6A6A6A] mb-1">No. of Questions</label>
                    <Input
                      value={type.numQuestions}
                      onChange={(e) => handleQuestionTypeChange(index, "numQuestions", e.target.value)}
                      placeholder="0"
                      type="number"
                      className="px-4 py-3 border border-[#7D5CB0] rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1 max-w-[150px]">
                    <label className="block text-sm font-medium text-[#6A6A6A] mb-1">Marks per Q</label>
                    <Input
                      value={type.marksPerQuestion}
                      onChange={(e) => handleQuestionTypeChange(index, "marksPerQuestion", e.target.value)}
                      placeholder="1"
                      type="number"
                      className="px-4 py-3 border border-[#7D5CB0] rounded-lg text-sm"
                    />
                  </div>
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
            rows={6}
          />
        </div>

        {/* Upload Reference Material Section */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-black mb-4">Upload Reference Material</h3>
          <FileUploadSection onFileUpload={handleFileUpload} uploadedFileName={uploadedFile?.name} />
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 border-t border-gray-200 pt-4 lg:pt-6 mt-4 bg-white">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        {/* Generate Button */}
        <div className="flex justify-center lg:justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || isLoading}
            className={`w-full lg:w-auto px-6 py-4 lg:py-6 rounded-xl font-semibold text-white transition-all ${
              isFormValid && !isLoading
                ? "bg-[#DF6647] hover:bg-[#FF5A35] shadow-lg hover:shadow-xl cursor-pointer"
                : "bg-[#B5B5B5] opacity-60 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Generating..." : "Generate Assessment"}
          </Button>
        </div>
      </div>

      <AddTypeDialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen} />
    </div>
  )
}
