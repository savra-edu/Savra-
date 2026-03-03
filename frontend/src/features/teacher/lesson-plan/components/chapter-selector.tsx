"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChapterSelectorProps {
  chapters: string[]
  selectedChapters: string[]
  onToggleChapter: (chapter: string) => void
}

export function ChapterSelector({ chapters, selectedChapters, onToggleChapter }: ChapterSelectorProps) {
  const handleSelectChange = (value: string) => {
    // On mobile, clear previous selection and set new one
    selectedChapters.forEach(chapter => {
      if (chapter !== value) {
        onToggleChapter(chapter) // Remove previous
      }
    })
    // Add new selection if not already selected
    if (!selectedChapters.includes(value)) {
      onToggleChapter(value)
    }
  }

  return (
    <>
      {/* Mobile: Dropdown */}
      <div className="lg:hidden w-full">
        <Select value={selectedChapters[0] || ""} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full border-[#A56AFF]">
            <SelectValue placeholder="Select Chapters" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
            {chapters.map((chapter) => (
              <SelectItem key={chapter} value={chapter}>
                {chapter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Pills */}
      <div className="hidden lg:flex flex-wrap gap-4">
        {chapters.map((chapter) => (
          <button
            key={chapter}
            onClick={() => onToggleChapter(chapter)}
            className={`px-8 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
              selectedChapters.includes(chapter)
                ? "border-[#A56AFF] bg-[#EFE9F8] text-black"
                : "border-[#4612CF87] bg-white text-[#000000]"
            }`}
          >
            {chapter}
          </button>
        ))}
      </div>
    </>
  )
}
