/**
 * Returns the public-facing base URL for the app.
 * Use for share links so they work in production (not localhost).
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
