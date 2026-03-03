"use client"

import { useState } from "react"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function TeacherSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [schoolCode, setSchoolCode] = useState("")
  const [location, setLocation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword || !schoolCode) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      await register({
        name,
        email,
        password,
        role: "teacher",
        schoolCode,
        location: location || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 relative bg-white md:bg-[#F9F9F9]">
      {/* Mobile Layout */}
      <div className="w-full max-w-md md:hidden">
        <Link
          href="/teacher/login"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
        >
          <ChevronLeft size={24} />
        </Link>

        <div className="text-center mb-6 pt-12">
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
          <h2 className="text-xl font-semibold text-[#242220]">Teacher Sign Up</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">School Code *</label>
            <input
              type="text"
              placeholder="Enter school code"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Location (Optional)</label>
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12"
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

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 disabled:bg-[#DF6647]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-6"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <Link href="/teacher/login" className="text-[#DF6647] font-medium text-sm hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>

      {/* Desktop Layout */}
      <div style={{ background: "linear-gradient(180deg, rgba(236, 231, 243, 1) 0%, rgba(252, 254, 255, 1) 100%)" }} className="hidden md:block w-full max-w-4xl rounded-2xl shadow-lg p-8 md:p-12 relative">
        <Link
          href="/teacher/login"
          className="absolute top-8 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-gray-500 hover:text-gray-700 z-10"
        >
          <ChevronLeft size={20} />
        </Link>

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
          <h2 className="text-xl font-semibold text-[#242220]">Teacher Sign Up</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          {error && (
            <div className="w-[400px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 w-[400px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Email *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 w-[400px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">School Code *</label>
              <input
                type="text"
                placeholder="Enter school code"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="px-4 w-[192px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#242220] mb-2">Location (Optional)</label>
              <input
                type="text"
                placeholder="Your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 w-[192px] py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[400px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12"
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

          <div>
            <label className="block text-sm font-medium text-[#242220] mb-2">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-[400px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-[400px] bg-[#DF6647] hover:bg-[#DF6647]/90 disabled:bg-[#DF6647]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-4"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <Link href="/teacher/login" className="text-[#DF6647] font-medium text-sm hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
