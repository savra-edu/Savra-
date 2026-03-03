// Storage utility for Savra AI chat conversations

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  fileUrl?: string
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'savra-ai-conversations'

/**
 * Get all saved conversations from localStorage
 */
export function getSavedConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const conversations = JSON.parse(stored) as ChatConversation[]
    // Sort by updatedAt (most recent first)
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Error reading conversations from storage:', error)
    return []
  }
}

/**
 * Save a conversation to localStorage
 */
export function saveConversation(conversation: ChatConversation): void {
  if (typeof window === 'undefined') return

  try {
    const conversations = getSavedConversations()

    // Remove existing conversation with same ID if exists
    const filtered = conversations.filter(c => c.id !== conversation.id)

    // Add/update the conversation
    filtered.push(conversation)

    // Sort by updatedAt (most recent first)
    const sorted = filtered.sort((a, b) => b.updatedAt - a.updatedAt)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  } catch (error) {
    console.error('Error saving conversation to storage:', error)
  }
}

/**
 * Delete a conversation from localStorage
 */
export function deleteConversation(conversationId: string): void {
  if (typeof window === 'undefined') return

  try {
    const conversations = getSavedConversations()
    const filtered = conversations.filter(c => c.id !== conversationId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting conversation from storage:', error)
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(conversationId: string): ChatConversation | null {
  const conversations = getSavedConversations()
  return conversations.find(c => c.id === conversationId) || null
}

/**
 * Generate a title from the first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters, or first sentence, whichever is shorter
  const trimmed = firstMessage.trim()
  if (trimmed.length <= 50) return trimmed

  const firstSentence = trimmed.split(/[.!?]/)[0]
  if (firstSentence.length <= 50) return firstSentence

  return trimmed.substring(0, 47) + '...'
}

/**
 * Get recent conversations (last N conversations)
 */
export function getRecentConversations(limit: number = 10): ChatConversation[] {
  const conversations = getSavedConversations()
  return conversations.slice(0, limit)
}
