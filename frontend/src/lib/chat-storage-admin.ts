/**
 * Admin-scoped chat storage — separate from teacher/student conversations.
 * Uses a dedicated localStorage key so admin chat history does not mix with educator sessions.
 */

import type { ChatConversation, ChatMessage } from "./chat-storage"

const ADMIN_STORAGE_KEY = "savra-ai-conversations-admin"

export function getAdminSavedConversations(): ChatConversation[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!stored) return []
    const conversations = JSON.parse(stored) as ChatConversation[]
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

export function saveAdminConversation(conversation: ChatConversation): void {
  if (typeof window === "undefined") return
  try {
    const conversations = getAdminSavedConversations()
    const filtered = conversations.filter((c) => c.id !== conversation.id)
    filtered.push(conversation)
    const sorted = filtered.sort((a, b) => b.updatedAt - a.updatedAt)
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sorted))
  } catch {
    // no-op
  }
}

export function getAdminConversation(conversationId: string): ChatConversation | null {
  const conversations = getAdminSavedConversations()
  return conversations.find((c) => c.id === conversationId) || null
}

export function generateAdminConversationTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim()
  if (trimmed.length <= 50) return trimmed
  const firstSentence = trimmed.split(/[.!?]/)[0]
  if (firstSentence.length <= 50) return firstSentence
  return trimmed.substring(0, 47) + "..."
}

export function getAdminRecentConversations(limit: number = 10): ChatConversation[] {
  return getAdminSavedConversations().slice(0, limit)
}
