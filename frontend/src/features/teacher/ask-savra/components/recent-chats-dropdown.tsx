"use client"

import { useState, useEffect, useRef } from "react"
import { getRecentConversations, type ChatConversation } from "@/lib/chat-storage"
import { useRouter } from "next/navigation"
import { MessageSquare, ChevronDown, ClockIcon } from "lucide-react"

export function RecentChatsDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadConversations = () => {
      const recent = getRecentConversations(5) // Get last 5 conversations
      setConversations(recent)
    }

    loadConversations()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadConversations()
    }
    window.addEventListener('storage', handleStorageChange)

    // Also check periodically (for same-tab updates)
    const interval = setInterval(loadConversations, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return 'Today'
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
  }

  if (conversations.length === 0) {
    return null
  }

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
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                router.push(`/ask-savra-page?conversation=${conversation.id}`)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9B61FF] to-[#7C3AED] flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">S</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{conversation.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{formatDate(conversation.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => {
                router.push('/history')
                setIsOpen(false)
              }}
              className="w-full text-center text-sm text-[#9B61FF] hover:text-[#7C3AED] font-medium py-2"
            >
              View all history
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
