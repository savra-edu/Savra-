"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useFetch } from "@/hooks/use-api"

interface QuestionOption {
  text: string
  percentage: number
}

interface MissedQuestion {
  id: string
  number: string
  title: string
  percentage: number
  question?: string | null
  options?: QuestionOption[]
  mostChosenAnswer?: string
}

interface TopQuestionsMissedProps {
  quizId: string | null
}

// Placeholder missed questions data
const PLACEHOLDER_QUESTIONS: MissedQuestion[] = [
  {
    id: "q1",
    number: "Q1",
    title: "Fraction Addition",
    percentage: 45,
    question: "What is 1/2 + 1/4?",
    options: [
      { text: "A) 3/4", percentage: 45 },
      { text: "B) 2/6", percentage: 30 },
      { text: "C) 1/6", percentage: 15 },
      { text: "D) 2/4", percentage: 10 }
    ],
    mostChosenAnswer: "Most chose: B"
  },
  {
    id: "q2",
    number: "Q5",
    title: "Decimal Conversion",
    percentage: 38,
    question: "Convert 5/8 to a decimal",
    options: [
      { text: "A) 0.625", percentage: 38 },
      { text: "B) 0.58", percentage: 25 },
      { text: "C) 0.8", percentage: 22 },
      { text: "D) 0.5", percentage: 15 }
    ],
    mostChosenAnswer: "Most chose: B"
  },
  {
    id: "q3",
    number: "Q7",
    title: "Mixed Operations",
    percentage: 32,
    question: "What is 2/5 + 3/10?",
    mostChosenAnswer: "Most chose: C"
  }
]

export function TopQuestionsMissed({ quizId }: TopQuestionsMissedProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const { data: questions, isLoading } = useFetch<MissedQuestion[]>(
    quizId ? `/teacher/analytics/quiz/${quizId}/top-missed-questions` : null
  )
  
  const finalQuestions = (questions && questions.length > 0) ? questions : PLACEHOLDER_QUESTIONS

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedQuestions(newExpanded)
  }

  return (
    <div className="space-y-4 bg-[#FEFBFE] p-4 lg:p-6 rounded-lg border border-[#F0EAFA]">
      <h3 className="text-lg lg:text-xl font-medium">Top Questions Missed</h3>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-4 border-[#DF6647] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && finalQuestions && finalQuestions.length > 0 && (
        <div className="bg-[#FEFBFE] rounded-lg overflow-hidden">
          <div className="divide-y">
            {finalQuestions.map((q) => (
              <div key={q.id} className="border-b last:border-b-0">
                {/* Main Question Row */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 text-left">
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-purple-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-700">Q</span>
                    </div>
                    <span className="font-medium text-foreground text-sm lg:text-base">
                      {q.number} - {q.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                    <span className="text-[#800000] font-medium text-xs lg:text-sm">{q.percentage}% Incorrect</span>
                    {q.mostChosenAnswer && (
                      <span className="text-xs lg:text-sm text-gray-500">{q.mostChosenAnswer}</span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform flex-shrink-0 ${expandedQuestions.has(q.id) ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedQuestions.has(q.id) && (
                  <div className="px-4 lg:px-6 bg-[#FEFBFE] py-3 lg:py-4 space-y-3 border-t">
                    {q.question && (
                      <>
                        <p className="font-medium text-foreground text-sm lg:text-base">{q.question}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2">
                            {q.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <input type="checkbox" className="rounded border-gray-300" disabled />
                                <span className="text-sm text-foreground">{option.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {!q.question && <p className="text-sm text-gray-500">{q.percentage}% chose incorrectly</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
