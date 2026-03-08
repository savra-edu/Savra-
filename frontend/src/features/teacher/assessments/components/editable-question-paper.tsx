"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Trash2, Plus } from "lucide-react"

export interface EditableQuestion {
  number: number
  text: string
  options?: string[]
  marks?: number
}

export interface EditableSection {
  type?: string
  title?: string
  name?: string
  instructions?: string
  questions: EditableQuestion[]
}

export interface EditableQuestionPaper {
  instructions?: string[]
  sections?: EditableSection[]
  questions?: EditableQuestion[]
}

interface EditableQuestionPaperProps {
  questionPaper: EditableQuestionPaper
  onSave: (paper: EditableQuestionPaper) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function normalizeToSections(paper: EditableQuestionPaper): EditableSection[] {
  if (paper.sections && paper.sections.length > 0) {
    return paper.sections
  }
  const flatQuestions = paper.questions || []
  if (flatQuestions.length > 0) {
    return [{
      title: "Questions",
      questions: flatQuestions.map((q, i) => ({ ...q, number: q.number || i + 1 })),
    }]
  }
  return [{ title: "Questions", questions: [] }]
}

export function EditableQuestionPaper({
  questionPaper,
  onSave,
  onCancel,
  isSaving,
}: EditableQuestionPaperProps) {
  const defaultInstructions = [
    "All questions are compulsory.",
    "The question paper is designed to test understanding and application of concepts.",
    "Show necessary steps for full marks.",
    "Use of calculator is not permitted.",
  ]
  const [paper, setPaper] = useState<EditableQuestionPaper>(() => ({
    instructions:
      questionPaper.instructions && questionPaper.instructions.length > 0
        ? questionPaper.instructions
        : defaultInstructions,
    sections: normalizeToSections(questionPaper),
  }))

  const updateInstruction = useCallback((index: number, value: string) => {
    setPaper((prev) => {
      const next = [...(prev.instructions || [])]
      next[index] = value
      return { ...prev, instructions: next }
    })
  }, [])

  const addInstruction = useCallback(() => {
    setPaper((prev) => ({
      ...prev,
      instructions: [...(prev.instructions || []), ""],
    }))
  }, [])

  const removeInstruction = useCallback((index: number) => {
    setPaper((prev) => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index),
    }))
  }, [])

  const updateSection = useCallback((sectionIdx: number, updates: Partial<EditableSection>) => {
    setPaper((prev) => {
      const sections = [...(prev.sections || [])]
      sections[sectionIdx] = { ...sections[sectionIdx], ...updates }
      return { ...prev, sections }
    })
  }, [])

  const updateQuestion = useCallback(
    (sectionIdx: number, questionIdx: number, updates: Partial<EditableQuestion>) => {
      setPaper((prev) => {
        const sections = [...(prev.sections || [])]
        const questions = [...(sections[sectionIdx]?.questions || [])]
        questions[questionIdx] = { ...questions[questionIdx], ...updates }
        sections[sectionIdx] = { ...sections[sectionIdx], questions }
        return { ...prev, sections }
      })
    },
    []
  )

  const updateOption = useCallback(
    (sectionIdx: number, questionIdx: number, optIdx: number, value: string) => {
      setPaper((prev) => {
        const sections = [...(prev.sections || [])]
        const questions = [...(sections[sectionIdx]?.questions || [])]
        const options = [...(questions[questionIdx]?.options || [])]
        options[optIdx] = value
        questions[questionIdx] = { ...questions[questionIdx], options }
        sections[sectionIdx] = { ...sections[sectionIdx], questions }
        return { ...prev, sections }
      })
    },
    []
  )

  const addOption = useCallback((sectionIdx: number, questionIdx: number) => {
    setPaper((prev) => {
      const sections = [...(prev.sections || [])]
      const questions = [...(sections[sectionIdx]?.questions || [])]
      const options = [...(questions[questionIdx]?.options || []), ""]
      questions[questionIdx] = { ...questions[questionIdx], options }
      sections[sectionIdx] = { ...sections[sectionIdx], questions }
      return { ...prev, sections }
    })
  }, [])

  const removeOption = useCallback((sectionIdx: number, questionIdx: number, optIdx: number) => {
    setPaper((prev) => {
      const sections = [...(prev.sections || [])]
      const questions = [...(sections[sectionIdx]?.questions || [])]
      const options = (questions[questionIdx]?.options || []).filter((_, i) => i !== optIdx)
      questions[questionIdx] = { ...questions[questionIdx], options }
      sections[sectionIdx] = { ...sections[sectionIdx], questions }
      return { ...prev, sections }
    })
  }, [])

  const addQuestion = useCallback((sectionIdx: number) => {
    setPaper((prev) => {
      const sections = [...(prev.sections || [])]
      const questions = sections[sectionIdx]?.questions || []
      const nextNum = questions.length > 0
        ? Math.max(...questions.map((q) => q.number || 0)) + 1
        : 1
      sections[sectionIdx] = {
        ...sections[sectionIdx],
        questions: [...questions, { number: nextNum, text: "" }],
      }
      return { ...prev, sections }
    })
  }, [])

  const removeQuestion = useCallback((sectionIdx: number, questionIdx: number) => {
    setPaper((prev) => {
      const sections = [...(prev.sections || [])]
      const questions = (sections[sectionIdx]?.questions || []).filter((_, i) => i !== questionIdx)
      sections[sectionIdx] = { ...sections[sectionIdx], questions }
      return { ...prev, sections }
    })
  }, [])

  const handleSave = useCallback(() => {
    onSave(paper)
  }, [paper, onSave])

  const sections = paper.sections || []

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 space-y-6">
        <div className="space-y-4">
          <p className="font-bold">General Instructions</p>
          <div className="space-y-2">
            {(paper.instructions || []).map((inst, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-gray-500 mt-2 flex-shrink-0">{i + 1}.</span>
                <Input
                  value={inst}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  placeholder="Instruction"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-red-500 hover:text-red-600"
                  onClick={() => removeInstruction(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="w-4 h-4 mr-1" /> Add instruction
            </Button>
          </div>
        </div>

        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2">
              <Input
                value={section.title || section.name || ""}
                onChange={(e) => updateSection(sectionIdx, { title: e.target.value })}
                placeholder="Section title"
                className="font-bold text-lg"
              />
              <Input
                value={section.instructions ?? ""}
                onChange={(e) => updateSection(sectionIdx, { instructions: e.target.value || undefined })}
                placeholder="Section instructions (optional)"
                className="text-sm text-gray-600"
              />
            </div>
            <div className="space-y-4">
              {(section.questions || []).map((q, questionIdx) => (
                <div
                  key={questionIdx}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Q{q.number || questionIdx + 1}</span>
                        <Input
                          value={q.marks ?? ""}
                          onChange={(e) =>
                            updateQuestion(sectionIdx, questionIdx, {
                              marks: e.target.value ? parseInt(e.target.value, 10) : undefined,
                            })
                          }
                          type="number"
                          placeholder="Marks"
                          className="w-16"
                        />
                        <span className="text-sm text-gray-500">marks</span>
                      </div>
                      <Textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(sectionIdx, questionIdx, { text: e.target.value })}
                        placeholder="Question text"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 flex-shrink-0"
                      onClick={() => removeQuestion(sectionIdx, questionIdx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {(q.options?.length ?? 0) > 0 && (
                    <div className="ml-4 space-y-2">
                      <p className="text-sm font-medium text-gray-600">Options</p>
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex gap-2 items-center">
                          <span className="text-gray-500 w-5">
                            {String.fromCharCode(97 + optIdx)})
                          </span>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(sectionIdx, questionIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeOption(sectionIdx, questionIdx, optIdx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(sectionIdx, questionIdx)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add option
                      </Button>
                    </div>
                  )}
                  {(q.options?.length ?? 0) === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => addOption(sectionIdx, questionIdx)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add options (MCQ)
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion(sectionIdx)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add question
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 flex gap-3 p-4 border-t border-gray-200 bg-white">
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#DF6647] hover:bg-[#DF6647]/90">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
