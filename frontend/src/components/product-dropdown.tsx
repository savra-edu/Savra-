'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const productItems = [
  { name: 'Lesson Planning', href: '/features/lesson-plan' },
  { name: 'Assessments', href: '/features/assessments' },
  { name: 'Gamified Quizzes', href: '/gamified' },
  { name: 'Announcements', href: '/features/announcements' },
  { name: 'Class Analytics', href: '/features/analytics' },
]

export default function ProductDropdown() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <div className="bg-white border border-[#000000] rounded-2xl shadow-xl overflow-hidden w-full max-w-[600px] relative z-[9999]">
      <div className="flex flex-col md:flex-row">
        {/* Left Section - Navigation List */}
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
          <nav className="flex flex-col gap-3 md:gap-5">
            {productItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-bold text-sm md:text-base transition-all py-2 px-3 rounded-lg ${
                  isActive(item.href) 
                    ? 'bg-[#CCC3DE] text-[#0A0B1E]' 
                    : 'text-[#0A0B1E] hover:opacity-70'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-gray-300 my-4"></div>

        {/* Right Section - Placeholder Image */}
        <div className="hidden md:flex flex-1 p-6 items-center justify-center">
          <Image src="/dropdown.svg" alt="Product Dropdown" width={200} height={200} />
        </div>
      </div>
    </div>
  )
}
