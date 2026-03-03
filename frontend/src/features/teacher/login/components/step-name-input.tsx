"use client"

import type React from "react"

import { useState } from "react"

interface StepNameInputProps {
  onInput: (name: string) => void
  value?: string
}

export function StepNameInput({ onInput, value = "" }: StepNameInputProps) {
  const [name, setName] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    onInput(newName)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-[#242220] text-center mb-3">Enter Name</label>
      <input
        type="text"
        value={name}
        onChange={handleChange}
        placeholder="Your Name"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 text-[#242220] placeholder-[#8C8C8C] transition-colors"
      />
    </div>
  )
}
