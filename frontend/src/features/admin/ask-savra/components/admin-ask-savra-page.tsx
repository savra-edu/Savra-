"use client"

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

import {
  Send,
  Mic,
  X,
  Plus,
  Paperclip,
  Image as ImageIcon,
  HardDrive,
  User,
  Sparkles,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAI } from "@/hooks/use-ai"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  saveAdminConversation,
  generateAdminConversationTitle,
  getAdminConversation,
} from "@/lib/chat-storage-admin"
import type { ChatConversation, ChatMessage } from "@/lib/chat-storage"
import { AdminRecentChatsDropdown } from "./admin-recent-chats-dropdown"
import ReactMarkdown from "react-markdown"

const ADMIN_ASK_SAVRA_PATH = "/admin/ask-savra"
const ADMIN_DASHBOARD_PATH = "/admin-dashboard"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  fileUrl?: string
}

export default function AdminAskSavraPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sendQuery, isLoading, error, clearError } = useAI()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const firstName = user?.name?.split(" ")[0] || "Admin"

  useEffect(() => {
    const queryParam = searchParams.get("query")
    const conversationParam = searchParams.get("conversation")

    if (messages.length === 0) {
      if (conversationParam) {
        const conversation = getAdminConversation(conversationParam)
        if (conversation) {
          setConversationId(conversation.id)
          setMessages(conversation.messages)
          return
        }
      }

      if (queryParam) {
        const sendInitialQuery = async () => {
          clearError()
          const userMsgId = Date.now().toString()
          setMessages([{ id: userMsgId, role: "user" as const, content: queryParam }])
          const result = await sendQuery(queryParam)
          if (result) {
            const backendConvId = result.conversationId
            setConversationId(backendConvId)
            const finalMessages = [
              { id: userMsgId, role: "user" as const, content: queryParam },
              {
                id: (Date.now() + 1).toString(),
                role: "assistant" as const,
                content: result.response,
              },
            ]
            setMessages(finalMessages)
            saveAdminConversation({
              id: backendConvId,
              title: generateAdminConversationTitle(queryParam),
              messages: finalMessages as ChatMessage[],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }
        }
        sendInitialQuery()
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition })
          .webkitSpeechRecognition || (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          setMessage(event.results[0][0].transcript)
          setIsListening(false)
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageToSend?: string) => {
    const messageText = messageToSend || message.trim()
    if (!messageText || isLoading) return

    const userMessage = messageText.trim()
    setMessage("")
    clearError()

    const userMsgId = Date.now().toString()
    const newMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content: userMessage },
    ]
    setMessages(newMessages)

    const result = await sendQuery(userMessage, conversationId || undefined)

    if (result) {
      const backendConvId = result.conversationId
      if (!conversationId) setConversationId(backendConvId)

      const finalMessages = [
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: result.response,
        },
      ]
      setMessages(finalMessages)

      const existingConv = getAdminConversation(backendConvId)
      const title =
        existingConv?.title ||
        (messages.length === 0 ? generateAdminConversationTitle(userMessage) : existingConv?.title || "Chat")

      saveAdminConversation({
        id: backendConvId,
        title,
        messages: finalMessages as ChatMessage[],
        createdAt: existingConv?.createdAt || Date.now(),
        updatedAt: Date.now(),
      })
    }
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser")
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const startNewConversation = () => {
    setConversationId(null)
    setMessages([])
    clearError()
    router.push(ADMIN_ASK_SAVRA_PATH)
    if (searchParams.get("query")) router.replace(ADMIN_ASK_SAVRA_PATH)
  }

  const handleFileSelect = (type: "file" | "image") => {
    setShowFileMenu(false)
    if (type === "file") fileInputRef.current?.click()
    else imageInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    alert(`File "${file.name}" selected. File upload functionality will be implemented.`)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    alert(`Image "${file.name}" selected. Image upload functionality will be implemented.`)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleDriveClick = () => {
    setShowFileMenu(false)
    alert("Google Drive integration will be implemented.")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showFileMenu && !target.closest(".file-menu-container")) setShowFileMenu(false)
    }
    if (showFileMenu) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showFileMenu])

  const hasMessages = messages.length > 0
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Morning" : currentHour < 18 ? "Afternoon" : "Evening"

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 border-r border-[#F5EFEB66]"
        style={{ background: "linear-gradient(180deg, #F0EAFA 0%, #EBE6F2 100%)" }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#F5EFEB66]">
            <div className="flex items-center justify-center">
              <Image src="/images/savra-logo.png" alt="SAVRA" width={163} height={140} sizes="163px" className="w-[163px] h-[140px]" />
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9B61FF] to-[#7C3AED] hover:from-[#8B51EF] hover:to-[#6C2AED] border-0 rounded-lg text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New chat</span>
            </button>
          </div>

          <div className="flex-1 px-4 overflow-y-auto">
            <div className="text-[10px] font-semibold text-[#24222066] uppercase tracking-widest mb-4 px-3">MAIN</div>
            <div className="space-y-2">
              <AdminRecentChatsDropdown />
              <Link
                href={ADMIN_DASHBOARD_PATH}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-800 hover:bg-gray-200/60 rounded-lg transition-all"
              >
                <span className="font-medium">Dashboard</span>
              </Link>
            </div>
          </div>

          <div className="p-4 border-t border-[#F5EFEB66]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DF6647] flex items-center justify-center text-white font-semibold text-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-800 text-sm font-medium truncate">{firstName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:pl-64">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Link href={ADMIN_DASHBOARD_PATH} className="text-gray-600 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </Link>
              <div className="w-24 h-6 relative">
                <Image src="/images/savra-logo-45456f.png" alt="SAVRA" fill sizes="96px" className="object-contain" />
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={startNewConversation}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#9B61FF] to-[#7C3AED] hover:from-[#8B51EF] hover:to-[#6C2AED] rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New chat</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="text-center max-w-2xl w-full mx-auto">
                <div className="text-6xl mb-8">✨</div>
                <div className="mb-8 flex flex-col items-center">
                  <div className="w-40 h-14 relative mb-3">
                    <Image src="/images/savra-logo-45456f.png" alt="Savra AI" fill sizes="160px" className="object-contain" priority />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Your Admin Assistant</p>
                </div>
                <div className="mb-8">
                  <h1 className="text-5xl font-semibold text-gray-900 mb-4">
                    {greeting}, {firstName}
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">How can I help you today?</p>
                </div>
                <div className="space-y-3 max-w-lg mx-auto">
                  <button
                    onClick={() => handleSend("Suggest a classroom activity")}
                    className="w-full px-6 py-4 text-left bg-white border-2 border-gray-200 hover:border-[#9B61FF] hover:bg-[#9B61FF]/5 rounded-xl transition-all text-gray-800 font-medium"
                  >
                    Suggest a classroom activity
                  </button>
                  <button
                    onClick={() => handleSend("Create a rubric for evaluating")}
                    className="w-full px-6 py-4 text-left bg-white border-2 border-gray-200 hover:border-[#9B61FF] hover:bg-[#9B61FF]/5 rounded-xl transition-all text-gray-800 font-medium"
                  >
                    Create a rubric for evaluating
                  </button>
                  <button
                    onClick={() => handleSend("Give application-based questions")}
                    className="w-full px-6 py-4 text-left bg-white border-2 border-gray-200 hover:border-[#9B61FF] hover:bg-[#9B61FF]/5 rounded-xl transition-all text-gray-800 font-medium"
                  >
                    Give application-based questions
                  </button>
                  <button
                    onClick={() => handleSend("Give examples to explain any topic")}
                    className="w-full px-6 py-4 text-left bg-white border-2 border-gray-200 hover:border-[#9B61FF] hover:bg-[#9B61FF]/5 rounded-xl transition-all text-gray-800 font-medium"
                  >
                    Give examples to explain any topic
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
              <div className="space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className="shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                          msg.role === "user" ? "bg-[#DF6647]" : "bg-gradient-to-br from-[#9B61FF] to-[#7C3AED]"
                        }`}
                      >
                        {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                      </div>
                    </div>
                    <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block max-w-[85%] text-left ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-[#DF6647]/10 to-[#DF6647]/5 text-gray-900 rounded-2xl px-5 py-3.5 border border-[#DF6647]/20"
                            : "text-gray-800"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9B61FF] to-[#7C3AED] flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 bg-[#9B61FF] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[#9B61FF] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-[#9B61FF] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 text-red-600 text-sm text-center border-t border-red-100">{error}</div>
        )}

        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4">
            <div className="relative">
              <div
                className="relative flex items-center rounded-2xl border-2 transition-all"
                style={{
                  background: "linear-gradient(90deg, #CFF4F6 0%, #EDD8FF 50%, #FFF4E6 100%)",
                  borderColor: message.trim() ? "#9B61FF" : "#E5E7EB",
                }}
              >
                <div className="absolute inset-[2px] bg-white rounded-2xl" />
                <div className="relative flex items-center w-full z-10 px-4 py-4">
                  <div className="relative file-menu-container">
                    <button
                      onClick={() => setShowFileMenu(!showFileMenu)}
                      className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
                      title="Attach file"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    {showFileMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[180px] z-50">
                        <button onClick={() => handleFileSelect("file")} className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                          <Paperclip className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Files</span>
                        </button>
                        <button onClick={() => handleFileSelect("image")} className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Photos</span>
                        </button>
                        <button onClick={handleDriveClick} className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                          <HardDrive className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Google Drive</span>
                        </button>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" />
                    <input ref={imageInputRef} type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                  </div>
                  <input
                    type="text"
                    placeholder="How can I help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-base px-3"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMicClick}
                      className={`p-2 rounded-lg transition-colors ${isListening ? "text-red-500 bg-red-50" : "text-gray-500 hover:bg-gray-100"}`}
                      title="Voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSend()}
                      disabled={!message.trim() || isLoading}
                      className="p-2 bg-[#DF6647] text-white rounded-lg hover:bg-[#DF6647]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
