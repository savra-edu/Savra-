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

interface AddTypeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export default function AddTypeDialog({ open: controlledOpen, onOpenChange, children }: AddTypeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  
  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const questionTypes = [
    "Diagram-Based Questions",
    "Fill in the Blanks",
    "Numerical / Problem Solving",
  ]

  const handleSelectType = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        // Deselect if already selected
        return prev.filter((t) => t !== type)
      } else {
        // Select if not selected
        return [...prev, type]
      }
    })
  }

  const handleAdd = () => {
    if (selectedTypes.length > 0) {
      // Handle add logic here
      console.log("Adding types:", selectedTypes)
      setOpen(false)
      setSelectedTypes([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

          <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-8">
            {questionTypes.map((type) => (
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
