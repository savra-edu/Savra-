'use client'

import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ProductDropdown from '@/components/product-dropdown';

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProductExpanded, setIsProductExpanded] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === ''
    }
    return pathname?.startsWith(path)
  }

  const isHomePage = pathname === '/' || pathname === ''

  return (
    <nav 
      className="w-full bg-white"
      style={{
        ...(isHomePage && {
          backgroundImage: 'url(/bg-dots.svg)',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        })
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between h-16 md:h-24">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 md:gap-2">
          <Image src="/logo1.png" alt="Logo" width={24} height={24} className="md:w-[30px] md:h-[30px]" />
          <Image src="/logo2.png" alt="Logo" width={60} height={60} className="md:w-[80px] md:h-[80px]" />
        </Link>

        {/* Desktop Center Navigation */}
        <div className="hidden lg:flex bg-[#303030] rounded-2xl px-4 md:px-6 py-2 items-center gap-4 md:gap-6 lg:gap-10">
          <Link 
            href="/" 
            className={`text-white text-xs md:text-sm pb-1 transition cursor-pointer ${
              isActive('/') ? 'border-b-2 border-white' : 'hover:opacity-80'
            }`}
          >
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-xs md:text-sm flex items-center gap-1 md:gap-2 hover:opacity-80 transition cursor-pointer">
              Product
              <ChevronDown size={14} strokeWidth={1.25} className="md:w-4 md:h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-transparent border-none shadow-none p-0 z-[9999]" 
              align="center"
              sideOffset={20}
            >
              <ProductDropdown />
            </DropdownMenuContent>
          </DropdownMenu>

          <Link 
            href="/our-story" 
            className={`text-white text-xs md:text-sm pb-1 transition cursor-pointer ${
              isActive('/our-story') ? 'border-b-2 border-white' : 'hover:opacity-80'
            }`}
          >
            Our Story
          </Link>
          
          <Link 
            href="/get-in-touch" 
            className={`text-white text-xs md:text-sm pb-1 transition cursor-pointer ${
              isActive('/get-in-touch') ? 'border-b-2 border-white' : 'hover:opacity-80'
            }`}
          >
            Contact Us
          </Link>

          <Link href="/onboarding">
            <Button className="bg-white text-[#000000] rounded-full px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:bg-gray-100">
              Start for free
            </Button>
          </Link>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center gap-2 md:gap-4">
          <Link href="/onboarding" className="text-[#333333] text-xs md:text-sm font-medium transition hover:opacity-80 cursor-pointer">
            Log In
          </Link>
          <Link href="/onboarding">
            <Button className="bg-[#333333] text-white rounded-lg px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen)
            if (isMobileMenuOpen) {
              setIsProductExpanded(false)
            }
          }}
          className="lg:hidden p-2 text-[#333333]"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white rounded-3xl shadow-lg mx-4 mb-4 mt-2 animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-[#333333] text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            
            <div className="space-y-2">
              <button
                onClick={() => setIsProductExpanded(!isProductExpanded)}
                className="w-full flex items-center justify-between text-[#333333] text-base font-semibold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>Product</span>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform duration-200 ${
                    isProductExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isProductExpanded && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <Link 
                    href="/features/lesson-plan" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProductExpanded(false)
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive('/features/lesson-plan') 
                        ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Lesson Planning
                  </Link>
                  <Link 
                    href="/features/assessments" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProductExpanded(false)
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive('/features/assessments') 
                        ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Assessments
                  </Link>
                  <Link 
                    href="/gamified" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProductExpanded(false)
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive('/gamified') 
                        ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Gamified Quizzes
                  </Link>
                  <Link 
                    href="/features/announcements" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProductExpanded(false)
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive('/features/announcements') 
                        ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Announcements
                  </Link>
                  <Link 
                    href="/features/analytics" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProductExpanded(false)
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive('/features/analytics') 
                        ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Class Analytics
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/our-story" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-[#333333] text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                isActive('/our-story') 
                  ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Our Story
            </Link>
            
            <Link 
              href="/get-in-touch" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-[#333333] text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                isActive('/get-in-touch') 
                  ? 'bg-[#CCC3DE] text-[#4E30A5] font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Contact Us
            </Link>

            <div className="pt-4 space-y-3 border-t border-gray-100">
              <Link 
                href="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[#333333] text-base font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full bg-[#333333] text-white rounded-lg py-2.5 text-base font-medium hover:bg-[#2a2a2a] transition-colors">
                  Sign Up
                </Button>
              </Link>
              <Link 
                href="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full bg-white text-[#000000] border-2 border-[#333333] rounded-full py-2.5 text-base font-medium hover:bg-gray-50 transition-colors">
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
