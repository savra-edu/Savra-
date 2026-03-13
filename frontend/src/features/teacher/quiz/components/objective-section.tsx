"use client"

import Image from "next/image"

interface QuizObjectiveSectionProps {
  objective: string
  onObjectiveChange: (value: string) => void
  placeholder?: string
  title?: string
}

export function QuizObjectiveSection({ objective, onObjectiveChange, placeholder, title }: QuizObjectiveSectionProps) {
  return (
    <div className="mb-2">
      <div className="bg-[#EFE9F8] rounded-t-lg px-6 py-4 flex items-center justify-between border border-[#F6F6F9]">
        <h3 className="text-base font-bold text-[#000000]">{title || "Quiz Objective"}</h3>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <span className="text-sm font-medium">Enhance prompt</span>
          <Image src="/images/magic-wand.svg" alt="magic wand" width={24} height={24} sizes="24px" />
        </button>
      </div>
      <textarea
        value={objective}
        onChange={(e) => onObjectiveChange(e.target.value)}
        placeholder={placeholder || "Tell Savra what you'd like this quiz to test — for example, basic understanding, application, or deeper thinking."}
        className="w-full px-6 py-2 border-t-0 text-sm rounded-b-lg border border-[#DCDCDC]"
        rows={6}
      />
    </div>
  )
}
