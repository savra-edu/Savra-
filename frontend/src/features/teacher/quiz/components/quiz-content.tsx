"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuizObjectiveSection } from "@/features/teacher/quiz/components/objective-section"
import { FileUploadSection } from "@/features/teacher/lesson-plan/components/file-upload-section"
import { GeneratingOverlay } from "@/components/generating-overlay"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useChapters } from "@/hooks/use-chapters"

interface Chapter {
    id: string
    name: string
}

interface Quiz {
    id: string
    title: string
    status: string
}

interface QuizContentProps {
    selectedClassId: string
    selectedSubjectId: string
}

export default function QuizContent({ selectedClassId, selectedSubjectId }: QuizContentProps) {
    const router = useRouter()

    // Chapters - load based on selected subject
    const { data: chaptersData, isLoading: chaptersLoading } = useChapters(selectedSubjectId || undefined)
    const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])

    const [totalQuestions, setTotalQuestions] = useState<string>("")
    const [difficultyLevel, setDifficultyLevel] = useState<string>("")
    const [timeLimit, setTimeLimit] = useState<string>("20")
    const [objective, setObjective] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset chapters when subject changes
    useEffect(() => {
        setSelectedChapterIds([])
    }, [selectedSubjectId])

    // Form validation (Quiz Objective is optional)
    const isFormValid = useMemo(() => {
        return selectedClassId !== "" &&
               selectedSubjectId !== "" &&
               selectedChapterIds.length > 0 &&
               totalQuestions !== ""
    }, [selectedClassId, selectedSubjectId, selectedChapterIds, totalQuestions])

    const toggleChapter = (chapterId: string) => {
        setSelectedChapterIds((prev) =>
            prev.includes(chapterId) ? prev.filter((c) => c !== chapterId) : [...prev, chapterId]
        )
    }

    const handleFileUpload = (file: File) => {
        setUploadedFile(file)
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

            const questionsCount = parseInt(totalQuestions) || 10

            // Create quiz with correct field names
            const quizData = {
                classId: selectedClassId,
                subjectId: selectedSubjectId,
                chapterIds: selectedChapterIds,
                title: selectedChapterNames.join(", ") || "Quiz",
                totalQuestions: questionsCount,
                totalMarks: questionsCount, // 1 mark per question by default
                difficultyLevel: (difficultyLevel || "medium").toLowerCase() as "easy" | "medium" | "hard",
                timeLimit: parseInt(timeLimit) || 20,
                objective: objective.trim() || undefined,
                referenceFileUrl,
            }

            const response = await api.post<{ success: boolean; data: Quiz }>("/quizzes", quizData)
            const quiz = response.data

            // Generate questions
            await api.post(`/quizzes/${quiz.id}/generate`, {})

            // Navigate to generated quiz page with ID
            router.push(`/quiz/generated?id=${quiz.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate quiz")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            {isLoading && <GeneratingOverlay type="quiz" onCancel={() => setIsLoading(false)} />}
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

                {/* Quiz Options */}
                <div className="flex flex-row flex-wrap gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-semibold text-[#000000]">Number of Questions</label>
                        <Select value={totalQuestions} onValueChange={setTotalQuestions}>
                            <SelectTrigger className="w-[150px] border-[#A56AFF]">
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

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-semibold text-[#000000]">Time Limit (mins)</label>
                        <Select value={timeLimit} onValueChange={setTimeLimit}>
                            <SelectTrigger className="w-[150px] border-[#A56AFF]">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
                                <SelectItem value="10">10 mins</SelectItem>
                                <SelectItem value="15">15 mins</SelectItem>
                                <SelectItem value="20">20 mins</SelectItem>
                                <SelectItem value="30">30 mins</SelectItem>
                                <SelectItem value="45">45 mins</SelectItem>
                                <SelectItem value="60">60 mins</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Objective Section (optional) */}
                <div className="mb-6">
                    <QuizObjectiveSection objective={objective} onObjectiveChange={setObjective} title="Quiz Objective (optional)" />
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
                <div className="flex justify-center lg:justify-end gap-2">
                    <Button className="border border-[#DF6647] text-[#DF6647] bg-white px-6 py-4 lg:py-6 rounded-xl hover:bg-[#DF6647]/10 font-semibold">
                        View Drafts
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!isFormValid || isLoading}
                        className={`px-6 py-4 lg:py-6 rounded-xl font-semibold text-white transition-all ${
                            isFormValid && !isLoading
                                ? "bg-[#DF6647] hover:bg-[#FF5A35] shadow-lg hover:shadow-xl cursor-pointer"
                                : "bg-[#B5B5B5] opacity-60 cursor-not-allowed"
                        }`}
                    >
                        {isLoading ? "Generating..." : "Generate Quiz"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
