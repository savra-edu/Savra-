import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { validateContactForm } from '@/lib/validations'
import { appendContactFormData } from '@/lib/google-sheets'
import { sendAdminNotification } from '@/lib/email'

/**
 * Rate limiting storage (in-memory)
 * Maps IP address to array of request timestamps
 */
const rateLimitMap = new Map<string, number[]>()

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10)

/**
 * Check if IP address has exceeded rate limit
 * @param ip - Client IP address
 * @returns true if rate limit exceeded
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Filter out timestamps older than the rate limit window
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  )

  // Update the map with filtered timestamps
  if (recentTimestamps.length === 0) {
    rateLimitMap.delete(ip)
  } else {
    rateLimitMap.set(ip, recentTimestamps)
  }

  // Check if limit exceeded
  return recentTimestamps.length >= MAX_REQUESTS
}

/**
 * Add request timestamp for IP address
 * @param ip - Client IP address
 */
function recordRequest(ip: string): void {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
}

/**
 * Clean up old rate limit entries periodically
 * Note: In serverless environments, this cleanup happens naturally during
 * the isRateLimited() function. Explicit cleanup via setInterval won't work
 * in serverless as the server doesn't persist between requests.
 */
function cleanupRateLimitMap(): void {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    )
    if (recentTimestamps.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, recentTimestamps)
    }
  }
}

// Note: setInterval removed - doesn't work in serverless environments
// Cleanup happens naturally in isRateLimited() function

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)

    // Check rate limit
    if (isRateLimited(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate form data with Zod
    let validatedData
    try {
      validatedData = validateContactForm(body)
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: fieldErrors,
          },
          { status: 400 }
        )
      }
      throw error // Re-throw if not a Zod error
    }

    // Record this request for rate limiting
    recordRequest(clientIP)

    // Save to Google Sheets (with retry logic)
    try {
      await appendContactFormData(validatedData)
    } catch (error) {
      console.error('Failed to save to Google Sheets:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save your submission. Please try again later.',
        },
        { status: 500 }
      )
    }

    // Send admin notification email (non-blocking - don't fail if this fails)
    sendAdminNotification(validatedData).catch((error) => {
      console.error('Failed to send admin notification:', error)
      // Don't fail the request if email fails
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in contact API route:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle non-POST requests
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Please use POST.',
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Please use POST.',
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Please use POST.',
    },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Please use POST.',
    },
    { status: 405 }
  )
}
