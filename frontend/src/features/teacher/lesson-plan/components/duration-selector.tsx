"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DurationSelectProps {
  value: string
  onChange: (value: string) => void
}

export function DurationSelect({ value, onChange }: DurationSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full lg:w-40 border-[#A56AFF]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent side="bottom" align="start" position="popper" sideOffset={4}>
        <SelectItem value="1">1 period</SelectItem>
        <SelectItem value="2">2 periods</SelectItem>
        <SelectItem value="3">3 periods</SelectItem>
        <SelectItem value="4">4 periods</SelectItem>
        <SelectItem value="5">5 periods</SelectItem>
        <SelectItem value="6">6 periods</SelectItem>
        <SelectItem value="7">7 periods</SelectItem>
        <SelectItem value="8">8 periods</SelectItem>
        <SelectItem value="9">9 periods</SelectItem>
        <SelectItem value="10">10 periods</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  )
}
