"use client"

import { useState } from "react"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { GoogleLoginButton } from "./google-login-button"

export function TeacherLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, loginWithGoogle, isLoading } = useAuth()

  const handleGoogleSuccess = async (credential: string) => {
    setError("")
    try {
      await loginWithGoogle(credential, "teacher")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
    }
  }

  const handleCreateAccount = () => {
    router.push("/teacher/signup")
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
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
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
          <h2 className="text-xl font-semibold text-[#242220]">Educator Log In</h2>
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
              className="w-full px-4 py-3 bg-white border border-[#DF6647] rounded-lg focus:outline-none focus:border-[#DF6647] focus:ring-2 focus:ring-[#DF6647]/20 placeholder-gray-400 text-[#242220] transition-colors"
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
            <Link href="/teacher/login/password-recovery" className="text-sm text-gray-500 hover:text-[#242220]">
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
            <span className="text-sm text-gray-500 font-medium">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Facebook */}
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <span className="text-white font-bold text-lg">f</span>
            </button>

            {/* Google - functional when configured */}
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={setError}
              variant="icon"
            />

            {/* Apple */}
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Image
                src="https://www.apple.com/favicon.ico"
                alt="Apple"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </button>
          </div>

          {/* Sign Up Button */}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full border-2 border-[#DF6647] text-[#DF6647] hover:bg-[#DF6647]/5 font-semibold py-3 rounded-lg transition-colors"
          >
            Create An Account
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
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-[#242220]">Educator Login</h2>
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
            <Link href="/teacher/login/password-recovery" className="text-sm text-gray-500 hover:text-[#242220]">
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
        </form>

        {/* Social Login */}
        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center justify-center w-[400px] gap-3 mb-6">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
            >
              <img 
                src="https://www.facebook.com/images/fb_icon_325x325.png" 
                alt="Facebook" 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231877F2'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E"
                }}
              />
              <span className="text-sm font-medium text-[#242220]">Facebook</span>
            </button>
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={setError}
              variant="full"
              className="flex-1"
            />
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
            >
              <img 
                src="https://www.apple.com/favicon.ico" 
                alt="Apple" 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M17.05 13.5c-.91 0-1.64.46-2.09 1.36h.1c.85-1.47 2.25-2.35 3.75-2.35 1.41 0 2.63.67 3.4 1.72h3.22c-.84-2.85-3.58-4.9-6.88-4.9-4.08 0-7.4 3.32-7.4 7.4 0 4.08 3.32 7.4 7.4 7.4 3.3 0 6.05-2.05 6.88-4.9h-3.22c-.77 1.05-1.99 1.72-3.4 1.72-1.5 0-2.9-.88-3.75-2.35h-.1c.45.9 1.18 1.36 2.09 1.36 1.34 0 2.43-1.09 2.43-2.43 0-1.34-1.09-2.43-2.43-2.43z'/%3E%3C/svg%3E"
                }}
              />
              <span className="text-sm font-medium text-[#242220]">Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex w-[400px] items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleCreateAccount}
            className="w-[400px] border-2 border-[#DF6647] text-[#DF6647] hover:bg-[#DF6647]/5 font-semibold py-3 rounded-lg transition-colors"
          >
            Create An Account
          </button>
        </div>
      </div>
    </div>
  )
}
