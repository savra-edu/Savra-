"use client"

import { useState } from "react"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function StudentLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, isLoading } = useAuth()

  const handleCreateAccount = () => {
    router.push("/student/signup")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      await login({ email, password })
      // Redirect handled by auth context based on role
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.")
    }
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 relative bg-white md:bg-[#F9F9F9]">
      {/* Mobile Layout */}
      <div className="w-full max-w-md md:hidden">
        {/* Back Button */}
        <Link 
          href="/onboarding"
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
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-[#242220]">Student Log In</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 px-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/student/login/password-recovery" className="text-sm text-gray-500 hover:text-[#242220]">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 disabled:bg-[#DF6647]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-8"
          >
            {isLoading ? "Signing in..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full border-2 border-[#DF6647] text-[#DF6647] hover:bg-[#DF6647]/5 font-semibold py-3 rounded-lg transition-colors"
          >
            Sign up
          </button>
        </form>
      </div>

      {/* Desktop Layout */}
      <div style={{ background: "linear-gradient(180deg, rgba(236, 231, 243, 1) 0%, rgba(252, 254, 255, 1) 100%)" }} className="hidden md:block w-full max-w-4xl rounded-2xl shadow-lg p-8 md:p-12 relative">
        <Link 
          href="/onboarding"
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
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-[#242220]">Student Login</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          {/* Error Message */}
          {error && (
            <div className="w-[400px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email address</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 w-[400px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[400px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right w-[400px]">
            <Link href="/student/login/password-recovery" className="text-sm text-gray-500 hover:text-[#242220]">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-[400px] bg-[#DF6647] hover:bg-[#DF6647]/90 disabled:bg-[#DF6647]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Signing in..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="flex w-[400px] items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-[400px] border-2 border-[#DF6647] text-[#DF6647] hover:bg-[#DF6647]/5 font-semibold py-3 rounded-lg transition-colors"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  )
}
