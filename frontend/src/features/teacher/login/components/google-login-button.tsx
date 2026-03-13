"use client"

import Image from "next/image"
import { GoogleLogin } from "@react-oauth/google"

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void
  onError: (message: string) => void
  /** Mobile: circular icon. Desktop: rectangular with text */
  variant?: "icon" | "full"
  className?: string
  /** When true, disables interaction (e.g. during API call) */
  disabled?: boolean
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export function GoogleLoginButton({
  onSuccess,
  onError,
  variant = "icon",
  className = "",
  disabled = false,
}: GoogleLoginButtonProps) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        className={`w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors ${className}`}
        aria-label="Google sign-in (not configured)"
      >
        <Image
          src="https://www.google.com/favicon.ico"
          alt="Google"
          width={24}
          height={24}
          sizes="24px"
          className="w-6 h-6 object-contain"
        />
      </button>
    )
  }

  const wrapperClass = disabled ? `${className} pointer-events-none opacity-60` : className

  if (variant === "full") {
    return (
      <div className={wrapperClass}>
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) {
              onSuccess(res.credential)
            } else {
              onError("Google sign-in failed")
            }
          }}
          onError={() => onError("Google sign-in was cancelled or failed")}
          theme="outline"
          size="large"
          type="standard"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) {
            onSuccess(res.credential)
          } else {
            onError("Google sign-in failed")
          }
        }}
        onError={() => onError("Google sign-in was cancelled or failed")}
        theme="outline"
        size="large"
        type="icon"
        shape="circle"
      />
    </div>
  )
}
