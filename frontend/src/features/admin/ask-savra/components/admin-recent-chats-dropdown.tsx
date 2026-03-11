"use client"

import { useState, useEffect, useRef } from "react"
import { getAdminRecentConversations } from "@/lib/chat-storage-admin"
import type { ChatConversation } from "@/lib/chat-storage"
import { useRouter } from "next/navigation"
import { MessageSquare, ChevronDown, ClockIcon } from "lucide-react"

const ADMIN_ASK_SAVRA_PATH = "/admin/ask-savra"

export function AdminRecentChatsDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadConversations = () => setConversations(getAdminRecentConversations(5))
    loadConversations()
    const interval = setInterval(loadConversations, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) return "Today"
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (conversations.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-gray-800 hover:bg-gray-200/60 rounded-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chats</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                router.push(`${ADMIN_ASK_SAVRA_PATH}?conversation=${conv.id}`)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9B61FF] to-[#7C3AED] flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">S</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{conv.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
