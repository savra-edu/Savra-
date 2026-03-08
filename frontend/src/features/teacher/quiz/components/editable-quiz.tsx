"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2 } from "lucide-react"

export interface EditableQuizQuestion {
  id: string
  text: string
  options: string[]
  correctAnswerIndex: number
}

interface EditableQuizProps {
  questions: EditableQuizQuestion[]
  onSave: (questions: EditableQuizQuestion[]) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

export function EditableQuiz({
  questions: initialQuestions,
  onSave,
  onCancel,
  isSaving,
}: EditableQuizProps) {
  const [questions, setQuestions] = useState<EditableQuizQuestion[]>(initialQuestions)

  const updateQuestion = useCallback((index: number, updates: Partial<EditableQuizQuestion>) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }, [])

  const updateOption = useCallback((questionIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev]
      const opts = [...(next[questionIdx].options || [])]
      opts[optIdx] = value
      next[questionIdx] = { ...next[questionIdx], options: opts }
      return next
    })
  }, [])

  const setCorrectAnswer = useCallback((questionIdx: number, correctIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[questionIdx] = { ...next[questionIdx], correctAnswerIndex: correctIndex }
      return next
    })
  }, [])

  const addOption = useCallback((questionIdx: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      const opts = [...(next[questionIdx].options || []), ""]
      next[questionIdx] = { ...next[questionIdx], options: opts }
      return next
    })
  }, [])

  const removeOption = useCallback((questionIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      const opts = (next[questionIdx].options || []).filter((_, i) => i !== optIdx)
      const oldCorrect = next[questionIdx].correctAnswerIndex
      const newCorrect =
        oldCorrect >= opts.length ? Math.max(0, opts.length - 1) : oldCorrect
      next[questionIdx] = {
        ...next[questionIdx],
        options: opts,
        correctAnswerIndex: newCorrect,
      }
      return next
    })
  }, [])

  const handleSave = useCallback(() => {
    onSave(questions)
  }, [questions, onSave])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 space-y-6">
        <p className="font-bold text-base text-gray-700">Edit questions and options. Select the correct answer for each question.</p>
        {questions.map((q, questionIdx) => (
          <div
            key={q.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Question {questionIdx + 1}</span>
            </div>
            <Textarea
              value={q.text}
              onChange={(e) => updateQuestion(questionIdx, { text: e.target.value })}
              placeholder="Question text"
              rows={3}
              className="resize-none w-full"
            />
            <div className="ml-2 space-y-2">
              <p className="text-sm font-medium text-gray-600">Options (select correct answer)</p>
              {(q.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name={`correct-${questionIdx}`}
                    checked={q.correctAnswerIndex === optIdx}
                    onChange={() => setCorrectAnswer(questionIdx, optIdx)}
                    className="w-4 h-4 text-[#7D5CB0] cursor-pointer"
                  />
                  <span className="text-gray-500 w-6">{String.fromCharCode(65 + optIdx)})</span>
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(questionIdx, optIdx, e.target.value)}
                    placeholder={`Option ${optIdx + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 shrink-0"
                    onClick={() => removeOption(questionIdx, optIdx)}
                    disabled={(q.options?.length || 0) <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(questionIdx)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add option
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
