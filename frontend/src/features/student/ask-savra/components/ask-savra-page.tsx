"use client"

import { Search, Upload, Camera, Loader2, Send, Paperclip, X, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAI } from "@/hooks/use-ai"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  fileUrl?: string
}

export default function AskSavraPage() {
  const { user } = useAuth()
  const { sendQuery, uploadFile, isLoading, error, clearError } = useAI()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get first name from user
  const firstName = user?.name?.split(" ")[0] || "Student"

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    clearError()

    // Add user message to chat
    const userMsgId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: userMessage,
        fileUrl: uploadedFileUrl || undefined,
      },
    ])

    // Clear uploaded file after sending
    setUploadedFileUrl(null)
    setUploadedFileName(null)

    // Send to API
    const result = await sendQuery(userMessage, conversationId || undefined, uploadedFileUrl || undefined)

    if (result) {
      setConversationId(result.conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
        },
      ])
    }
  }

  const handleUpload = async () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const fileUrl = await uploadFile(file)
    setIsUploading(false)

    if (fileUrl) {
      setUploadedFileUrl(fileUrl)
      setUploadedFileName(file.name)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Create video element
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      // Create canvas and capture frame
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop())

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" })
          setIsUploading(true)
          const fileUrl = await uploadFile(file)
          setIsUploading(false)

          if (fileUrl) {
            setUploadedFileUrl(fileUrl)
            setUploadedFileName("Captured Photo")
          }
        }
      }, "image/jpeg")
    } catch {
      alert("Camera access denied or not available")
    }
  }

  const removeUploadedFile = () => {
    setUploadedFileUrl(null)
    setUploadedFileName(null)
  }

  const startNewConversation = () => {
    setConversationId(null)
    setMessages([])
    setUploadedFileUrl(null)
    setUploadedFileName(null)
    clearError()
  }

  // Show chat interface if we have messages
  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-[#242220]">Ask Savra AI Tutor</h1>
        {hasMessages && (
          <Button variant="outline" size="sm" onClick={startNewConversation}>
            New Chat
          </Button>
        )}
      </div>

      {!hasMessages ? (
        <>
          {/* Greeting */}
          <p className="text-3xl text-center lg:text-xl font-bold text-[#242220] mb-8">
            Hi {firstName}, What do you want to learn today?
          </p>

          {/* Input Field */}
          <div className="mb-8">
            <div
              className="relative flex items-center px-4 py-4 rounded-2xl"
              style={{
                background: "linear-gradient(90deg, #CFF4F6 0%, #EDD8FF 50%, #FFF4E6 100%)",
              }}
            >
              <div className="absolute inset-[2px] bg-white rounded-2xl" />
              <div className="relative flex items-center w-full z-10">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Type a Message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400 text-black"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Uploaded File Preview */}
          {uploadedFileName && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Paperclip className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 flex-1 truncate">{uploadedFileName}</span>
              <button onClick={removeUploadedFile} className="text-purple-600 hover:text-purple-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload Reference Material Section */}
          <div className="mb-8">
            <h2 className="text-base lg:text-lg font-bold text-[#242220] mb-4">Upload Reference Material</h2>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 bg-[#B595FF] border-[#E8E2F0] hover:bg-[#F0EAFA] text-[#242220] font-semibold py-6 rounded-xl"
              >
                {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                Upload a File
              </Button>
              <Button
                variant="outline"
                onClick={handleTakePhoto}
                disabled={isUploading}
                className="flex-1 bg-[#B595FF] border-[#E8E2F0] hover:bg-[#F0EAFA] text-[#242220] font-semibold py-6 rounded-xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {/* Search Button */}
          <div className="mt-auto">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-6 rounded-xl text-base disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-orange-100" : "bg-purple-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-orange-50 text-gray-900"
                      : "bg-purple-50 text-gray-900"
                  }`}
                >
                  {msg.fileUrl && (
                    <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      Attached file
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {/* Uploaded File Preview */}
          {uploadedFileName && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
              <Paperclip className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 flex-1 truncate">{uploadedFileName}</span>
              <button onClick={removeUploadedFile} className="text-purple-600 hover:text-purple-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input */}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-shrink-0"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </Button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="bg-[#DF6647] hover:bg-[#DF6647]/90 flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </>
      )}

      {/* Hidden file input */}
      {!hasMessages && <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />}
    </div>
  )
}
