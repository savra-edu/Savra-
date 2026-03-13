"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DurationSelect } from "@/features/teacher/lesson-plan/components/duration-selector"
import { ObjectiveSection } from "@/features/teacher/lesson-plan/components/objective-section"
import { GeneratingOverlay } from "@/components/generating-overlay"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { api } from "@/lib/api"
import { useChapters } from "@/hooks/use-chapters"
import { useTeacherSubjectsData } from "@/hooks/use-subjects"
import { useTeacherClasses } from "@/hooks/use-classes"
import { useAuth } from "@/contexts/auth-context"
import { LessonPeriod } from "@/types/api"

interface Lesson {
    id: string
    title: string
    status: string
    content?: string
}

interface Chapter {
    id: string
    name: string
}

interface CreateLessonProps {
    selectedSubject?: string
    selectedClass?: string
}

export default function CreateLesson({ selectedSubject, selectedClass }: CreateLessonProps) {
    const router = useRouter()
    const { user } = useAuth()

    // Fetch teacher's subjects and classes to get IDs
    const { data: subjectsData } = useTeacherSubjectsData()
    const { data: classesData } = useTeacherClasses()

    // Parse subject and class from header props
    const selectedSubjectObj = subjectsData?.find((s: any) => s.name === selectedSubject)
    const selectedSubjectId = selectedSubjectObj?.id || ""
    
    // Parse class from "Class: 10 A" format
    const parseClassFromHeader = (classValue?: string) => {
        if (!classValue) return null
        const match = classValue.match(/Class:\s*(\d+)\s*([A-Z])/i)
        if (match) {
            const grade = parseInt(match[1])
            const section = match[2].toUpperCase()
            return classesData?.find((c: any) => c.grade === grade && c.section === section)
        }
        return null
    }
    
    const selectedClassObj = parseClassFromHeader(selectedClass)
    const selectedClassId = selectedClassObj?.id || ""

    // Chapters - load based on subject + grade (grade-specific CBSE/NCERT chapters)
    const selectedGrade = selectedClassObj?.grade ?? null
    const { data: chaptersData, isLoading: chaptersLoading } = useChapters(selectedSubjectId || undefined, selectedGrade ?? undefined)
    const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
    const chapterIds = useMemo(() => chaptersData?.map((chapter: Chapter) => chapter.id) ?? [], [chaptersData])
    const areAllChaptersSelected = chapterIds.length > 0 && chapterIds.every((chapterId) => selectedChapterIds.includes(chapterId))

    const [duration, setDuration] = useState<string>("")
    const [objective, setObjective] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [periods, setPeriods] = useState<LessonPeriod[]>([])

    // Get selected class and subject data
    const selectedClassData = selectedClassObj
    const selectedSubjectData = selectedSubjectObj
    const teacherName = user?.name || ""

    // Get numberOfPeriods from duration dropdown
    const numberOfPeriods = duration === "other" ? 1 : (duration ? parseInt(duration) : 1)

    // Auto-generate periods when duration changes
    useEffect(() => {
        const periodsCount = duration === "other" ? 1 : (duration ? parseInt(duration) : 1)
        if (periodsCount > 0) {
            const newPeriods: LessonPeriod[] = []
            for (let i = 1; i <= periodsCount; i++) {
                // Check if period already exists
                const existingPeriod = periods.find(p => p.periodNo === i)
                if (existingPeriod) {
                    newPeriods.push(existingPeriod)
                } else {
                    newPeriods.push({
                        id: `temp-${i}`,
                        lessonId: "",
                        periodNo: i,
                    })
                }
            }
            setPeriods(newPeriods)
        } else {
            setPeriods([])
        }
    }, [duration])

    // Reset chapters when subject or grade changes (different chapter sets)
    useEffect(() => {
        setSelectedChapterIds([])
    }, [selectedSubjectId, selectedGrade])

    const isFormValid = useMemo(() => {
        return selectedClassId !== "" &&
               selectedSubjectId !== "" &&
               selectedChapterIds.length > 0 &&
               duration !== ""
    }, [selectedClassId, selectedSubjectId, selectedChapterIds, duration])

    const toggleChapter = (chapterId: string) => {
        setSelectedChapterIds((prev) =>
            prev.includes(chapterId) ? prev.filter((c) => c !== chapterId) : [...prev, chapterId]
        )
    }

    const toggleAllChapters = () => {
        setSelectedChapterIds(areAllChaptersSelected ? [] : chapterIds)
    }

    const handleFileUpload = (file: File) => {
        setUploadedFile(file)
    }

    const handleCreateLessonPlan = async () => {
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

            // Convert periods to duration in minutes (1 period = 40 minutes)
            const MINUTES_PER_PERIOD = 40
            const durationInMinutes = duration === "other"
                ? 60 // Default 60 minutes for "other"
                : parseInt(duration) * MINUTES_PER_PERIOD

            // Generate topic using LLM
            let generatedTopic = ""
            if (selectedSubjectData && selectedChapterNames.length > 0 && selectedClassData) {
                try {
                    const topicResponse = await api.post<{ success: boolean; data: { topic: string } }>("/lessons/generate-topic", {
                        subject: selectedSubjectData.name,
                        chapters: selectedChapterNames,
                        grade: selectedClassData.grade
                    })
                    generatedTopic = topicResponse.data.topic || selectedChapterNames.join(", ")
                } catch (topicError) {
                    console.warn("Failed to generate topic, using chapter names:", topicError)
                    generatedTopic = selectedChapterNames.join(", ")
                }
            } else {
                generatedTopic = selectedChapterNames.join(", ") || "New Lesson"
            }

            // Prepare periods data (remove temp IDs)
            const periodsData = periods.map(p => ({
                periodNo: p.periodNo,
                concept: p.concept,
                learningOutcomes: p.learningOutcomes,
                teacherLearningProcess: p.teacherLearningProcess,
                assessment: p.assessment,
                resources: p.resources,
                centurySkillsValueEducation: p.centurySkillsValueEducation,
                realLifeApplication: p.realLifeApplication,
                reflection: p.reflection,
            }))

            // Create lesson with required fields
            const lessonData = {
                classId: selectedClassId,
                subjectId: selectedSubjectId,
                chapterIds: selectedChapterIds,
                title: selectedChapterNames.join(", ") || generatedTopic || "New Lesson",
                objective,
                duration: durationInMinutes,
                referenceFileUrl,
                topic: generatedTopic,
                numberOfPeriods,
                periods: periodsData,
            }

            const response = await api.post<{ success: boolean; data: Lesson }>("/lessons", lessonData)
            const lesson = response.data

            // Generate AI content for the lesson plan
            try {
                const generateResponse = await api.post<{ success: boolean; data: Lesson }>(`/lessons/${lesson.id}/generate`, { regenerate: false })
                console.log("Lesson content generated:", generateResponse.data)
                // Small delay to ensure database is updated
                await new Promise(resolve => setTimeout(resolve, 500))
            } catch (generateError) {
                console.error("Failed to generate lesson content:", generateError)
                // Continue to edit page even if generation fails
            }

            // Navigate to edit page with lesson ID
            router.push(`/lesson-plan/edit?id=${lesson.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create lesson plan")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            {isLoading && <GeneratingOverlay type="lesson" onCancel={() => setIsLoading(false)} />}
            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
                {/* Chapters Section */}
                <div className="mb-6 lg:mb-12">
                    <div className="flex flex-row flex-wrap items-start justify-between gap-4 lg:gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-base font-bold text-[#000000]">Select Chapters</h2>
                                {selectedSubjectId && !chaptersLoading && chapterIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAllChapters}
                                        className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                            areAllChaptersSelected
                                                ? "bg-[#E8E2F0] border-[#9B61FF] text-[#242220]"
                                                : "bg-white border-[#D9C6FF] text-[#9B61FF] hover:bg-[#F6F1FF]"
                                        }`}
                                    >
                                        {areAllChaptersSelected ? "Clear All" : "Select All"}
                                    </button>
                                )}
                            </div>
                            {!selectedSubjectId ? (
                                <p className="text-gray-500 text-sm">Loading subjects...</p>
                            ) : chaptersLoading ? (
                                <div className="w-6 h-6 border-2 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
                            ) : chaptersData && chaptersData.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {chaptersData.map((chapter: Chapter) => (
                                        <button
                                            type="button"
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
                        <div className="flex flex-col gap-4">
                            <label className="text-base font-semibold text-[#000000]">Duration:</label>
                            <DurationSelect value={duration} onChange={setDuration} />
                        </div>
                    </div>
                </div>

                {/* Objective Section */}
                <div className="mb-6">
                    <ObjectiveSection objective={objective} onObjectiveChange={setObjective} />
                </div>

            </div>

            {/* Fixed Bottom Section */}
            <div className="shrink-0 border-t border-gray-200 pt-4 lg:pt-6 mt-4 bg-white">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <h3 className="text-base font-bold text-black mb-4">Upload Reference Material</h3>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                        alert('File size exceeds 10MB limit. Please choose a smaller file.')
                                        e.target.value = ''
                                        return
                                    }
                                    handleFileUpload(file)
                                }
                            }}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#B595FF] hover:bg-[#A085EF] text-white w-[250px] py-4 lg:py-6 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload a File
                        </Button>
                        {uploadedFile && <span className="text-sm text-gray-500">{uploadedFile.name}</span>}
                    </div>
                    <Button
                        onClick={handleCreateLessonPlan}
                        disabled={!isFormValid || isLoading}
                        className={`lg:w-auto px-6 py-4 lg:py-6 rounded-xl font-semibold text-white transition-all ${
                            isFormValid && !isLoading
                                ? "bg-[#DF6647] hover:bg-[#FF5A35] shadow-lg hover:shadow-xl cursor-pointer"
                                : "bg-[#B5B5B5] opacity-60 cursor-not-allowed"
                        }`}
                    >
                        {isLoading ? "Generating..." : "Create Lesson Plan"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
