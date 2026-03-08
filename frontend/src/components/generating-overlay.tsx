"use client"

import { X } from "lucide-react"

interface GeneratingOverlayProps {
  type: "lesson" | "quiz" | "assessment"
  onCancel?: () => void
}

const CATCHY_LINES: Record<GeneratingOverlayProps["type"], string> = {
  lesson: "Your lesson plan is almost ready!",
  quiz: "Almost there — crafting your quiz…",
  assessment: "Your question paper is on its way!",
}

export function GeneratingOverlay({ type, onCancel }: GeneratingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-[#FAF8FC] rounded-2xl shadow-xl border border-[#E8E2F0] p-8 max-w-sm mx-4 text-center">
        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Stop generating"
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#6A6A6A] hover:text-[#9B61FF] hover:bg-[#E8E2F0]/50 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}
        <div className="w-14 h-14 mx-auto mb-5 border-4 border-[#E8E2F0] border-t-[#9B61FF] rounded-full animate-spin" />
        <p className="text-[#353535] font-semibold text-lg mb-1">Hang tight ....</p>
        <p className="text-[#6A6A6A] text-sm">{CATCHY_LINES[type]}</p>
      </div>
    </div>
  )
}
