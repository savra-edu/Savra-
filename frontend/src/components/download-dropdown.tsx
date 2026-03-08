"use client"

import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DownloadDropdownProps {
  onDownloadPDF: () => void
  onDownloadWord: () => void
  label?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  className?: string
  /** Compact: icon-only or smaller layout */
  compact?: boolean
}

export function DownloadDropdown({
  onDownloadPDF,
  onDownloadWord,
  label = "Download",
  variant = "outline",
  className,
  compact = false,
}: DownloadDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className} size={compact ? "icon" : "default"}>
          <Download size={compact ? 18 : 18} />
          {!compact && <span className="ml-2">{label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownloadPDF}>
          <FileText size={16} className="mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadWord}>
          <FileText size={16} className="mr-2" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
