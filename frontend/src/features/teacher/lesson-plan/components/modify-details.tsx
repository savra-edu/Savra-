"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Upload, Camera, Pencil, Loader2 } from "lucide-react"
import ModifyLesson from "./modify-lesson-plan"
import { ChapterSelector } from "./chapter-selector"
import { DurationSelect } from "./duration-selector"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useFetch } from "@/hooks/use-api"

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

export default function ModifyDetails() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const lessonId = searchParams.get("id")

    const [selectedChapters, setSelectedChapters] = useState<string[]>([])
    const [duration, setDuration] = useState<string>("")
    const [objective, setObjective] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch existing lesson data
    const { data: lesson, isLoading } = useFetch<any>(
        lessonId ? `/lessons/${lessonId}` : null,
        !!lessonId
    )

    // Populate form with existing lesson data
    useEffect(() => {
        if (lesson) {
            setObjective(lesson.objective || "")
            setDuration(lesson.numberOfPeriods?.toString() || "")
            // Set chapters from lesson data
            if (lesson.chapters && lesson.chapters.length > 0) {
                setSelectedChapters(lesson.chapters.map((c: any) => c.chapter?.name || c.name))
            }
        }
    }, [lesson])

    const suggestions = [
        "Make it shorter",
        "Add Real Life examples",
        "Simplify for slow learners",
        "Remove PYQ",
        "Make it exam-oriented",
        "Add more activity based questions"
    ]

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

    const handlePhotoCapture = () => {
        console.log("Take Photo clicked")
    }

    const handleModifyAndRegenerate = async () => {
        if (!lessonId) {
            setError("No lesson ID found")
            return
        }

        setIsRegenerating(true)
        setError(null)

        try {
            // Step 1: Save the modified objective to the lesson
            await api.put(`/lessons/${lessonId}`, {
                objective: objective || null,
                numberOfPeriods: duration ? parseInt(duration) : undefined,
            })

            // Step 2: Regenerate the lesson plan with new objective
            await api.post(`/lessons/${lessonId}/generate`, { regenerate: true })

            // Step 3: Navigate back to edit page with the lesson ID
            router.push(`/lesson-plan/edit?id=${lessonId}`)
        } catch (err) {
            console.error("Failed to regenerate lesson:", err)
            setError(err instanceof Error ? err.message : "Failed to regenerate lesson plan")
            setIsRegenerating(false)
        }
    }

    const toggleChapter = (chapter: string) => {
        setSelectedChapters((prev) => (prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]))
    }

    return (
        <>
            {/* Mobile Layout */}
            <div className="lg:hidden flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
                    {/* Select Chapters Section */}
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-[#000000] mb-4">Select Chapters</h2>
                        <ChapterSelector
                            chapters={SUGGESTED_CHAPTERS}
                            selectedChapters={selectedChapters}
                            onToggleChapter={toggleChapter}
                        />
                    </div>

                    {/* Duration Section */}
                    <div className="mb-6">
                        <label className="text-base font-semibold text-[#000000] mb-4 block">Duration:</label>
                        <DurationSelect value={duration} onChange={setDuration} />
                    </div>

                    {/* Lesson Objective Section */}
                    <div className="mb-6">
                        <div className="bg-[#EFE9F8] rounded-lg px-4 py-3 flex items-center justify-between border border-[#F6F6F9] mb-0">
                            <h3 className="text-base font-bold text-[#000000]">Lesson Objective</h3>
                            <Image src="/images/magic-wand.svg" alt="magic wand" width={24} height={24} />
                        </div>
                        <textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            className="w-full px-4 py-3 border-t-0 text-sm rounded-b-lg border border-[#DCDCDC] bg-white"
                            rows={8}
                        />
                    </div>

                    {/* Upload Reference Material Section */}
                    <div className="mb-6">
                        <h3 className="text-base font-bold text-black mb-4">Upload Reference Material</h3>
                        <div className="flex flex-row gap-3">
                            <div className="relative flex-1">
                                <input 
                                  type="file" 
                                  id="file-upload-mobile" 
                                  onChange={handleFileChange} 
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                />
                                <label htmlFor="file-upload-mobile">
                                    <Button className="w-full bg-[#B595FF] hover:bg-[#A085EF] text-white px-4 py-4 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Upload a File
                                    </Button>
                                </label>
                            </div>
                            <Button
                                onClick={handlePhotoCapture}
                                className="flex-1 bg-[#B595FF] hover:bg-[#A085EF] text-white px-4 py-3 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                Take Photo
                            </Button>
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
                        disabled={isRegenerating || isLoading || !lessonId}
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
                <div className="overflow-y-auto">
                    <ModifyLesson />
                </div>
                <div className="bg-[#F4F4F4] mt-8 rounded-3xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-6 flex justify-between items-center">
                        <h1 className="font-bold text-2xl text-[#242220]">Edit prompt</h1>
                        <button className="p-4 bg-white rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        {/* Suggestions Section */}
                        <div>
                            <h2 className="font-bold text-base text-[#000000] mb-4">Suggestions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="px-4 py-3 bg-white border-2 border-[#4612CF87] items-center rounded-lg text-xs font-medium"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modify Prompt Section */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center pt-4 pb-2 px-2 bg-[#EFE9F8] rounded-t-lg border border-[#F6F6F9]">
                                <h2 className="font-bold text-lg text-[#242220]">Modify Prompt</h2>
                                <Image src="/images/magic-wand.svg" alt="magic wand" width={24} height={24} />
                            </div>
                            <textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                placeholder="Share how you'd like this lesson to be taught (e.g., through activities, examples, or skills-based learning)"
                                className="flex-1 w-full px-4 py-6 bg-white border-2 border-[#F9F9F9] rounded-lg text-xs"
                                rows={8}
                            />
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex justify-around items-center gap-12 m-4">
                        <input
                            type="file"
                            id="file-upload-modify"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                        />
                        <label htmlFor="file-upload-modify">
                            <button className="w-[160px] bg-[#B595FF] text-white p-4 rounded-lg font-semibold flex text-xs items-center justify-center gap-2 cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Upload a File
                            </button>
                        </label>
                        <button
                            onClick={handleModifyAndRegenerate}
                            disabled={isRegenerating || isLoading || !lessonId}
                            className="w-[160px] bg-[#DF6647] text-white p-4 rounded-lg font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
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
                        <p className="text-red-500 text-xs text-center mt-2">{error}</p>
                    )}
                </div>
            </div>
        </>
    )
}