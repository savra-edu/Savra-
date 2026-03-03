"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function PasswordRecovery() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password recovery logic here
    console.log("Password recovery requested for:", email)
    // Navigate to reset password page with email as query param
    router.push(`/student/login/reset-password?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 relative bg-white md:bg-[#F9F9F9]">
      {/* Mobile Layout */}
      <div className="w-full max-w-md md:hidden">
        {/* Back Button */}
        <Link 
          href="/student/login"
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
        >
          <ChevronLeft size={24} />
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8 pt-12">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/savra-logo.png"
              alt="SAVRA Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-[#242220]">Password Recovery</h2>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8 px-4">
          <p className="text-sm text-gray-600">
            Enter your registered email address. We'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 px-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email address</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] transition-colors"
              required
            />
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-3 rounded-lg transition-colors mt-8"
          >
            Send Reset Link
          </button>
        </form>
      </div>

      {/* Desktop Layout */}
      <div style={{ background: "linear-gradient(180deg, rgba(236, 231, 243, 1) 0%, rgba(252, 254, 255, 1) 100%)" }} className="hidden md:block w-full max-w-4xl rounded-2xl shadow-lg p-8 md:p-12 relative">
        <Link 
          href="/student/login"
          className="absolute top-8 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-gray-500 hover:text-gray-700 z-10"
        >
          <ChevronLeft size={20} />
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/savra-logo.png"
              alt="SAVRA Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-[#242220]">Password Recovery</h2>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Enter your registered email address. We'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email address</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 w-[400px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] transition-colors"
              required
            />
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            className="w-[400px] bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  )
}
