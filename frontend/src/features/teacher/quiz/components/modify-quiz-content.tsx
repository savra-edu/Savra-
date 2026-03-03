"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Upload, Edit, Plus, Edit2, Camera, Loader2 } from "lucide-react"
import GeneratedQuiz from "./generated-quiz"
import { ChapterSelector } from "@/features/teacher/lesson-plan/components/chapter-selector"
import { QuizObjectiveSection } from "./objective-section"
import { FileUploadSection } from "@/features/teacher/lesson-plan/components/file-upload-section"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useFetch } from "@/hooks/use-api"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
    quantity: number | null
}

export default function ModifyQuizDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const quizId = searchParams.get("id")

    const [promptText, setPromptText] = useState("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
        { name: "MCQS", quantity: 10 },
        { name: "Case Study", quantity: 20 },
        { name: "Short", quantity: 10 },
        { name: "Long", quantity: 10 },
        { name: "Problem", quantity: 10 },
        { name: "Diagram", quantity: 10 },
    ])
    const [referenceBooks, setReferenceBooks] = useState<string | undefined>(undefined)
    const [selectedChapters, setSelectedChapters] = useState<string[]>([])
    const [chapter, setChapter] = useState<string | undefined>(undefined)
    const [numQuestions, setNumQuestions] = useState<string>("")
    const [level, setLevel] = useState<string>("")
    const [duration, setDuration] = useState<string>("")
    const [sidebarLevel, setSidebarLevel] = useState<string | undefined>(undefined)
    const [sidebarTotalMarks, setSidebarTotalMarks] = useState("")
    const [time, setTime] = useState("")
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch existing quiz data
    const { data: quiz, isLoading } = useFetch<any>(
        quizId ? `/quizzes/${quizId}` : null,
        !!quizId
    )

    // Populate form with existing quiz data
    useEffect(() => {
        if (quiz) {
            setPromptText(quiz.objective || "Tell Savra what you'd like this quiz to test — for example, basic understanding, application, or deeper thinking.")
            setLevel(quiz.difficultyLevel || "")
            setSidebarLevel(quiz.difficultyLevel || undefined)
            setNumQuestions(quiz.totalQuestions?.toString() || "")
            setSidebarTotalMarks(quiz.totalMarks?.toString() || "")
            setTime(quiz.timeLimit?.toString() || "")
            setDuration(quiz.timeLimit ? `${quiz.timeLimit} mins` : "")
            // Set chapters from quiz data
            if (quiz.chapters && quiz.chapters.length > 0) {
                setSelectedChapters(quiz.chapters.map((c: any) => c.chapter?.name || c.name))
            }
        }
    }, [quiz])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024 // 10MB
            if (file.size > maxSize) {
                alert(`File size exceeds 10MB limit. Please choose a smaller file.`)
                e.target.value = '' // Reset input
                return
            }
            setUploadedFile(file)
        }
    }

    const handleFileUpload = (file: File) => {
        setUploadedFile(file)
    }

    const handleQuantityChange = (index: number, quantity: number) => {
        const updated = [...questionTypes]
        updated[index].quantity = quantity
        setQuestionTypes(updated)
    }

    const toggleChapter = (chapter: string) => {
        setSelectedChapters((prev) => (prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]))
    }

    const handleModifyAndRegenerate = async () => {
        if (!quizId) {
            setError("No quiz ID found")
            return
        }

        setIsRegenerating(true)
        setError(null)

        try {
            // Step 1: Save the modified objective to the quiz
            await api.put(`/quizzes/${quizId}`, {
                objective: promptText || null,
                difficultyLevel: sidebarLevel || level || undefined,
                totalMarks: sidebarTotalMarks ? parseInt(sidebarTotalMarks) : undefined,
                timeLimit: time ? parseInt(time) : undefined,
            })

            // Step 2: Regenerate the quiz with new objective
            await api.post(`/quizzes/${quizId}/generate`, { regenerate: true })

            // Step 3: Navigate back to generated quiz page with the quiz ID
            router.push(`/quiz/generated?id=${quizId}`)
        } catch (err) {
            console.error("Failed to regenerate quiz:", err)
            setError(err instanceof Error ? err.message : "Failed to regenerate quiz")
            setIsRegenerating(false)
        }
    }

    return (
        <>
            {/* Mobile Layout */}
            <div className="lg:hidden flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
                    <div className="space-y-4">
                        {/* Quick Suggestions */}
                        <div>
                            <h3 className="text-base font-bold text-[#000000] mb-3">Quick Suggestions</h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Focus on concepts",
                                    "Add application questions",
                                    "Include diagrams",
                                    "Make it harder",
                                    "Make it easier",
                                    "Add HOTS questions"
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setPromptText(prev => prev ? `${prev}\n${suggestion}` : suggestion)}
                                        className="px-3 py-1.5 bg-white border border-[#E8E0F5] rounded-full text-xs text-[#6A6A6A] hover:bg-[#EFE9F8] hover:border-[#7D5CB0] transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Objective Section */}
                        <div>
                            <QuizObjectiveSection objective={promptText} onObjectiveChange={setPromptText} />
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
                        onClick={handleModifyAndRegenerate}
                        disabled={isRegenerating || isLoading || !quizId}
                        className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-6 rounded-xl text-base disabled:opacity-50"
                    >
                        {isRegenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Regenerating...
                            </>
                        ) : (
                            "Modify and Regenerate"
                        )}
                    </Button>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid h-full grid-cols-[3fr_2fr] gap-8 overflow-hidden">
                {/* Left Column - Question Paper Content */}
                <div className="overflow-y-auto">
                    <GeneratedQuiz />
                </div>

                {/* Right Column - Edit Prompt Sidebar */}
                <div className="bg-[#F4F4F4] rounded-3xl flex flex-col overflow-hidden border border-gray-200 h-full">
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-gray-200 flex-shrink-0">
                    <h1 className="font-bold text-2xl text-[#242220]">Edit prompt</h1>
                    <button className="p-2 hover:bg-gray-300 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* Suggestions Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#242220] mb-3">Quick Suggestions</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Focus on concepts",
                                "Add application questions",
                                "Include diagrams",
                                "Make it harder",
                                "Make it easier",
                                "Add HOTS questions"
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setPromptText(prev => prev ? `${prev}\n${suggestion}` : suggestion)}
                                    className="px-3 py-1.5 bg-white border border-[#E8E0F5] rounded-full text-xs text-[#6A6A6A] hover:bg-[#EFE9F8] hover:border-[#7D5CB0] transition"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modify Prompt Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center p-3 bg-[#EFE9F8] rounded-t-lg border border-[#E8E0F5]">
                            <h2 className="font-bold text-base text-[#242220]">Quiz Objective</h2>
                            <Edit2 className="w-5 h-5 text-[#DF6647]" />
                        </div>
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="Tell Savra what you'd like this quiz to test — for example, basic understanding, application, or deeper thinking."
                            className="flex-1 min-h-[200px] w-full px-4 py-4 bg-white border border-[#E8E0F5] rounded-b-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7D5CB0] resize-none"
                        />
                    </div>
                </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-col gap-2 p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="flex items-center justify-between gap-3">
                            <input
                              type="file"
                              id="file-upload-modify"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                            />
                            <label htmlFor="file-upload-modify" className="flex-1">
                                <button className="w-full bg-[#B595FF] text-white p-3 rounded-lg font-semibold flex text-xs items-center justify-center gap-2 cursor-pointer hover:bg-[#a07fd4] transition">
                                    <Upload className="w-4 h-4" />
                                    Upload a File
                                </button>
                            </label>
                            <button
                                onClick={handleModifyAndRegenerate}
                                disabled={isRegenerating || isLoading || !quizId}
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
        </>
    )
}
