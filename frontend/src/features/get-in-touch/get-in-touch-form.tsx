'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { Mail, Phone, MapPin, PhoneCall, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Footers from "../footers"

const MAILCHIMP_URL = 'https://savraedu.us2.list-manage.com/subscribe/post-json'
const MAILCHIMP_U = '8cc0c6a14bfeab346fa932e6a'
const MAILCHIMP_ID = '78a858c801'
const MAILCHIMP_F_ID = '00366ae3f0'
const MAILCHIMP_HONEYPOT_NAME = `b_${MAILCHIMP_U}_${MAILCHIMP_ID}`

interface MailchimpResponse {
  result: 'success' | 'error'
  msg: string
}

/**
 * Submit contact data to Mailchimp via JSONP.
 * Uses their post-json endpoint with a dynamic script tag to avoid CORS issues.
 */
function submitToMailchimp(data: {
  email: string
  firstName: string
  phone: string
  schoolName: string
  message: string
}): Promise<MailchimpResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `mc_cb_${Date.now()}`

    const params = new URLSearchParams({
      u: MAILCHIMP_U,
      id: MAILCHIMP_ID,
      f_id: MAILCHIMP_F_ID,
      c: callbackName,
      EMAIL: data.email,
      FNAME: data.firstName,
      PHONE: data.phone,
      COMPANY: data.schoolName,
      LNAME: data.message,
      [MAILCHIMP_HONEYPOT_NAME]: '',
    })

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Mailchimp request timed out'))
    }, 10000)

    function cleanup() {
      clearTimeout(timeout)
      delete (window as unknown as Record<string, unknown>)[callbackName]
      const scriptEl = document.getElementById(callbackName)
      if (scriptEl) scriptEl.remove()
    }

    ;(window as unknown as Record<string, unknown>)[callbackName] = (response: MailchimpResponse) => {
      cleanup()
      if (response.result === 'success') {
        resolve(response)
      } else {
        reject(response)
      }
    }

    const script = document.createElement('script')
    script.id = callbackName
    script.src = `${MAILCHIMP_URL}?${params.toString()}`
    script.onerror = () => {
      cleanup()
      reject(new Error('Failed to reach Mailchimp'))
    }
    document.head.appendChild(script)
  })
}

interface FormData {
  firstName: string
  email: string
  phone: string
  schoolName: string
  message: string
}

const INITIAL_FORM_DATA: FormData = {
  firstName: '',
  email: '',
  phone: '',
  schoolName: '',
  message: '',
}

export default function GetInTouchForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [submitStatus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitStatus('idle')
    setErrorMessage(null)
    setIsSubmitting(true)

    let apiOk = false
    let mailchimpOk = false
    let localError: string | null = null

    // 1. Submit to our API (Google Sheets + admin email)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        apiOk = true
      } else if (data.details && Array.isArray(data.details)) {
        localError = data.details
          .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
          .join(', ')
      } else {
        localError = data.error || 'Something went wrong. Please try again.'
      }
    } catch {
      console.error('API submission failed — will try Mailchimp')
    }

    // 2. Submit to Mailchimp (JSONP)
    try {
      await submitToMailchimp({
        email: formData.email,
        firstName: formData.firstName,
        phone: formData.phone,
        schoolName: formData.schoolName,
        message: formData.message,
      })
      mailchimpOk = true
    } catch (mcError) {
      const mcResponse = mcError as MailchimpResponse | Error
      if ('msg' in mcResponse && mcResponse.msg) {
        const alreadySubscribed = mcResponse.msg.toLowerCase().includes('already subscribed')
        if (alreadySubscribed) {
          mailchimpOk = true
        } else if (!apiOk) {
          localError = mcResponse.msg.replace(/<[^>]*>/g, '')
        }
      }
      if (!mailchimpOk) {
        console.error('Mailchimp submission failed:', mcError)
      }
    }

    if (apiOk || mailchimpOk) {
      setSubmitStatus('success')
      setErrorMessage(null)
      setFormData(INITIAL_FORM_DATA)
    } else {
      setSubmitStatus('error')
      setErrorMessage(localError || 'Submission failed. Please check your details and try again.')
    }

    setIsSubmitting(false)
  }, [formData])

  return (
    <div className="w-full mx-auto">
    <main className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A0B1E] text-center">
          Get In Touch
        </h1>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-16 py-6 md:py-12 lg:py-16 relative z-[700]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16">
          {/* Left - Contact Information Box */}
          <div className="bg-[#C7B1EE] rounded-3xl p-4 md:p-6 h-auto md:h-[600px] flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-2">
                  Contact Information
                </h2>
                <p className="text-black text-xs md:text-sm">
                  Say something to start a live chat!
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 md:space-y-6 mt-4 md:mt-26">
                {/* Phone */}
                <div className="flex items-center gap-3 md:gap-4">
                  <PhoneCall fill="black" className="w-5 h-5 md:w-6 md:h-6 text-black mt-1 flex-shrink-0" />
                  <a href="tel:+917009711997" className="text-black text-xs md:text-sm lg:text-base hover:text-gray-700 transition-colors cursor-pointer">
                    7009711997
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 md:gap-4">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-black mt-1 flex-shrink-0" />
                  <a href="mailto:savra.edu@gmail.com" className="text-black text-xs md:text-sm lg:text-base hover:text-gray-700 transition-colors cursor-pointer">
                    savra.edu@gmail.com
                  </a>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 md:gap-4">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-black mt-1 flex-shrink-0" />
                  <p className="text-black text-xs md:text-sm lg:text-base">
                    390, CDS Tower, Udyog Vihar Sector 20, Gurugram
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative curved shapes - Hidden on mobile */}
            <div className="hidden md:block absolute bottom-18 right-24 w-24 h-24 md:w-36 md:h-36 bg-[#C3ABEC] rounded-full -mr-8 -mb-8"></div>
            <div className="hidden md:block absolute bottom-0 -right-4 w-32 h-32 md:w-48 md:h-48 bg-[#A185D1] rounded-full -mr-8 -mb-8 opacity-60"></div>
          </div>

          {/* Right - Form */}
          <div className="flex flex-col justify-start p-2">
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-4 md:mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 text-sm md:text-base">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700 text-xs md:text-sm mt-1">
                    Thank you for contacting us. We&apos;ll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-4 md:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 text-sm md:text-base">
                    Submission Failed
                  </h3>
                  <p className="text-red-700 text-xs md:text-sm mt-1">
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Row 1: First Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              {/* Row 2: Phone + School Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 00000 00000"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Your school name"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              {/* Row 3: Message */}
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message.."
                  rows={4}
                  className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
                />
              </div>

              {/* Mailchimp honeypot — hidden from real users, catches bots */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                <input
                  type="text"
                  name={MAILCHIMP_HONEYPOT_NAME}
                  tabIndex={-1}
                  defaultValue=""
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2 relative z-[800]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors relative z-[800] text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
      <Footers />
    </div>
  )
}
