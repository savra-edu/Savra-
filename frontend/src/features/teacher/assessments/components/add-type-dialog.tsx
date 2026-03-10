"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DIALOG_TO_INTERNAL: Record<string, string> = {
  "Assertion Reasoning": "assertion_reasoning",
  "Diagram-Based Questions": "diagram_based",
  "Fill in the Blanks": "fill_in_blanks",
  "Numerical / Problem Solving": "problem_solving",
}

interface AddTypeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAdd?: (types: string[]) => void
  existingTypes?: string[]
  children?: React.ReactNode
}

export default function AddTypeDialog({ open: controlledOpen, onOpenChange, onAdd, existingTypes = [], children }: AddTypeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const allQuestionTypes = [
    "Assertion Reasoning",
    "Diagram-Based Questions",
    "Fill in the Blanks",
    "Numerical / Problem Solving",
  ]

  const availableTypes = allQuestionTypes.filter(
    (type) => !existingTypes.includes(DIALOG_TO_INTERNAL[type])
  )

  const handleSelectType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleAdd = () => {
    if (selectedTypes.length > 0) {
      onAdd?.(selectedTypes)
      setOpen(false)
      setSelectedTypes([])
    }
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) setSelectedTypes([])
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl h-[65vh] max-w-[calc(100%-2rem)]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold">
            Create Question Paper
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold mb-6 -mt-64">Add Question Type</h2>

          {availableTypes.length === 0 ? (
            <p className="text-gray-500 text-sm mb-8">All question types have been added.</p>
          ) : (
            <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-8">
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  variant="outline"
                  className={`px-4 py-3 h-auto text-sm font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? "bg-[#EFE9F8] border border-[#4612CF87] hover:bg-[#EFE9F8]"
                      : "bg-white border-[#4612CF87] text-gray-900 hover:bg-[#EFE9F8]"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-24">
            <Button
              onClick={handleAdd}
              disabled={selectedTypes.length === 0}
              className={`px-12 py-3 font-semibold ${
                selectedTypes.length > 0
                  ? "bg-[#DF6647] hover:bg-[#DF6647]/90 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
