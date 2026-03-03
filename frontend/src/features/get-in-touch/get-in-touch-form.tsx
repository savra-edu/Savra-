'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, PhoneCall, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Footers from "../footers"

export default function GetInTouchForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-dismiss success message after 5 seconds
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

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subject
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset previous status
    setSubmitStatus('idle')
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Success - show success message and reset form
        setSubmitStatus('success')
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: ''
        })
      } else {
        // Error - show error message
        setSubmitStatus('error')

        // Handle validation errors with field details
        if (data.details && Array.isArray(data.details)) {
          const fieldMessages = data.details.map((err: { field: string; message: string }) =>
            `${err.field}: ${err.message}`
          ).join(', ')
          setErrorMessage(fieldMessages)
        } else {
          setErrorMessage(data.error || 'Something went wrong. Please try again.')
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              {/* Email and Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border-b border-gray-400 bg-transparent py-2 text-black placeholder-gray-500 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="text-gray-900 text-sm font-semibold block mb-3">
                  Select Subject?
                </label>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {['General Inquiry', 'Support', 'Sales'].map((subject) => (
                    <label key={subject} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subject"
                        value={subject}
                        checked={formData.subject === subject}
                        onChange={() => handleSubjectChange(subject)}
                        className="w-4 h-4 accent-gray-900"
                      />
                      <span className="text-gray-700 text-sm">
                        {subject}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
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
