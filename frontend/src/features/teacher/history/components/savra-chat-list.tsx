"use client"

import { useEffect, useState } from "react"
import { getSavedConversations, deleteConversation, type ChatConversation } from "@/lib/chat-storage"
import { useRouter } from "next/navigation"
import { MessageSquare, Trash2 } from "lucide-react"

export function SavraChatList() {
  const router = useRouter()
  const [conversations, setConversations] = useState<ChatConversation[]>([])

  useEffect(() => {
    // Load conversations from storage
    const loadConversations = () => {
      const saved = getSavedConversations()
      setConversations(saved)
    }

    loadConversations()

    // Listen for storage changes (in case conversations are saved from another tab)
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

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId)
      setConversations(getSavedConversations())
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    })
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 lg:px-6 py-16 text-center text-gray-500">
        No Savra AI conversations yet. Start chatting to see your history here.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="px-4 lg:px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
          onClick={() => router.push(`/ask-savra-page?conversation=${conversation.id}`)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-[#9B61FF] flex-shrink-0" />
                <h3 className="font-medium text-gray-900 truncate">{conversation.title}</h3>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">
                {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(conversation.updatedAt)}</p>
            </div>
            <button
              onClick={(e) => handleDelete(conversation.id, e)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
