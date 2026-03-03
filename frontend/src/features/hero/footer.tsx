import { Instagram, Linkedin, Facebook } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-transparent -mt-16 md:-mt-24 lg:-mt-32 p-4 md:p-6 lg:p-10 px-4 md:px-8 lg:px-20 w-full">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_2fr_0.5fr] justify-center items-stretch gap-6 md:gap-8 lg:gap-12">
          {/* Left Section */}
          <div className="flex bg-[#FCFCFC] p-6 md:p-8 lg:p-10 rounded-3xl flex-col h-full relative z-10 shadow-lg">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
              Teaching,<br />
              simplified.
            </h2>
            <nav className="flex flex-col gap-2 mb-6 md:mb-8 text-sm text-gray-700">
              <a href="/our-story" className="hover:text-gray-900">About US</a>
              <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-900">Terms And Conditions</a>
            </nav>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center">
                <Image src="/logo1.png" alt="SAVRA" width={32} height={32} className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <Image src="/logo2.png" alt="SAVRA" width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 lg:w-[80px] lg:h-[80px]" />
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex bg-[#FCFCFC] p-6 md:p-8 lg:p-10 rounded-3xl flex-col h-full relative z-10 shadow-lg">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Support</h3>
            <p className="text-sm text-gray-700 mb-3 md:mb-4 leading-relaxed">
              Teaching can be tough. Tech support shouldn't be. Get instant help
            </p>
            <div className="space-y-2 md:space-y-3 text-sm text-gray-700">
              <a href="mailto:Savra.edu@gmail.com" className="hover:text-gray-900 transition-colors cursor-pointer block">
                Savra.edu@gmail.com
              </a>
              <p>Mon-Fri | School hours friendly</p>
              <a href="tel:+917009711997" className="hover:text-gray-900 transition-colors cursor-pointer block">
                +91 7009711997
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex bg-[#FCFCFC] rounded-3xl p-6 md:p-8 lg:p-10 flex-col h-full relative z-10 shadow-lg items-center md:col-span-2 lg:col-span-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Social</h3>
            <div className="flex flex-row md:flex-col gap-4 md:gap-6 items-center justify-center">
              <a
                href="https://www.instagram.com/savra.app?igsh=MXAzMmh6ZnBsbGhucw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                <Instagram size={20} strokeWidth={2} />
              </a>
              <a
                href="https://www.linkedin.com/company/savra-edu/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Linkedin size={20} strokeWidth={2} />
              </a>
              <a
                href="https://www.facebook.com/share/1AFCmVfKhg/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                <Facebook size={20} strokeWidth={2} />
              </a>
              <a
                href="https://x.com/Savra_Edu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter/X"
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                <Image src="/X.svg" alt="X" width={20} height={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
