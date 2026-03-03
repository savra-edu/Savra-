"use client"

import type React from "react"

import { useState } from "react"

interface StepAddSubjectProps {
  onInput: (subject: string) => void
  value?: string
  placeholder?: string
}

export function StepAddSubject({ onInput, value = "", placeholder = "Type subject" }: StepAddSubjectProps) {
  const [input, setInput] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    onInput(newValue)
  }

  return (
    <div className="flex justify-center">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 text-[#242220] placeholder:text-[#8C8C8C] transition-colors"
      />
    </div>
  )
}
