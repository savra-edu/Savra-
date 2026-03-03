"use client"

import { Search, Mic } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

export default function SearchBar() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition!
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        // Navigate to Ask Savra page with the transcript
        router.push(`/ask-savra-page?query=${encodeURIComponent(transcript)}`)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [router])

  const handleClick = () => {
    router.push('/ask-savra-page')
  }

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
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

  return (
    <div className="relative w-sm cursor-pointer" onClick={handleClick}>
      <div
        className="relative flex items-center px-8 py-2 rounded-3xl border border-[#9B61FF] transition-all hover:border-[#7C3AED]"
        style={{
          background: "linear-gradient(90deg, #CFF4F6 0%, #EDD8F0 97.84%)"
        }}
      >
        <Search className="w-5 h-5 text-black mr-3 flex-shrink-0" />

        <input
          type="text"
          placeholder="Ask Savra Ai"
          readOnly
          className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400 text-black cursor-pointer"
        />

        <button
          onClick={handleMicClick}
          className={`relative flex items-center justify-center ml-3 flex-shrink-0 pb-1 transition-colors ${
            isListening ? 'text-red-500' : 'text-black hover:text-gray-600'
          }`}
        >
          <Mic className="w-5 h-5" />
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  )
}