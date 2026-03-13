import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroMain() {
  return (
    <section 
      className="relative w-full min-h-screen py-12 md:py-20 px-4 md:px-8 lg:px-20 overflow-hidden"
      style={{
        backgroundImage: 'url(/bg-dots.svg)',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center'
      }}
    >
    {/* Decorative SVG Elements - Hidden on mobile, visible on larger screens */}
    {/* Mid-Left: Student analytics */}
    <Image
      src="/analytics.svg"
      alt="Student analytics"
      width={100}
      height={100}
      sizes="100px"
      className="hidden md:block absolute left-4 md:left-12 top-24 -translate-y-1/2 opacity-80 blur-xs transform rotate-360 drop-shadow-lg z-0"
    />

    <Image
      src="/analytics.svg"
      alt="Student analytics"
      width={120}
      height={120}
      sizes="120px"
      className="hidden md:block absolute -left-4 top-80 -translate-y-1/2  transform rotate-360 drop-shadow-lg z-0"
    />
    
    {/* Bottom-Left: Gamified quizzes */}
    <Image
      src="/quiz.svg"
      alt="Gamified quizzes"
      width={180}
      height={180}
      sizes="180px"
      className="hidden lg:block absolute -left-1 bottom-14 transform drop-shadow-lg z-0"
    />
    
    {/* Mid-Right: NEP based lesson plans */}
    <Image
      src="/lesson-plan-2.svg"
      alt="NEP based lesson plans"
      width={100}
      height={100}
      sizes="100px"
      className="hidden md:block absolute right-4 md:right-12 top-16 -translate-y-1/2 opacity-80 blur-sm transform -rotate-12 drop-shadow-lg z-0"
    />
    {/* Top-Right: Light purple, blurred */}
    <Image
      src="/lesson-plan.svg"
      alt=""
      width={120}
      height={120}
      sizes="120px"
      className="hidden md:block absolute right-0 top-48 transform z-0"
    />
    
    
    {/* Bottom-Right: Question paper */}
    <Image
      src="/question-paper.svg"
      alt="Question paper"
      width={180}
      height={180}
      sizes="180px"
      className="hidden lg:block absolute right-0 bottom-10 transform drop-shadow-lg z-0"
    />

    {/* Content */}
    <div className="max-w-4xl mx-auto text-center relative z-10 pt-8 md:pt-12">
      {/* Main Headline */}
      <h1 className="mb-4 md:mb-6 flex flex-col items-center justify-center">
        <div className="whitespace-nowrap">
          <span className="inline-block text-[48px] md:text-[80px] lg:text-[120px] bg-gradient-to-b from-black to-[#001354] text-transparent bg-clip-text">Your AI</span>{' '}
          <span 
            className="inline-block text-[48px] md:text-[80px] lg:text-[120px] font-bold bg-gradient-to-b from-[#C7AFFF] to-[#4E30A5] text-transparent bg-clip-text"
            style={{ textShadow: '0 4px 8px rgba(74, 56, 124, 0.25)' }}
          >
            TEACHING
          </span>
        </div>
        <div className="-mt-8 md:-mt-16 lg:-mt-28">
          <span 
            className="inline-block text-center text-[64px] md:text-[120px] lg:text-[180px] font-bold bg-gradient-to-b from-[#C7AFFF] to-[#4E30A5] text-transparent bg-clip-text"
            style={{ textShadow: '0 4px 8px rgba(74, 56, 124, 0.25)' }}
          >
            COMPANION
          </span>
        </div>
      </h1>

      {/* Subheading */}
      <h2 className="text-2xl md:text-4xl lg:text-5xl -mt-8 md:-mt-16 lg:-mt-20 font-light mb-2 bg-gradient-to-b from-black to-[#001354] text-transparent bg-clip-text">
        Built for Indian Classrooms
      </h2>

      {/* Description */}
      <p className="text-base md:text-lg lg:text-xl text-[#010D3E] mb-8 md:mb-12 leading-relaxed max-w-lg mx-auto px-4">
        Simplify lesson planning, generate assessments, create gamified quiz and personalize teaching - all aligned to CBSE and NEP 2020
      </p>

      {/* CTA Button */}
      <Link href="/onboarding">
        <Button className="bg-[#333333] text-white mt-4 md:mt-6 rounded-md px-6 md:px-8 py-4 md:py-6 text-sm md:text-base font-medium transition">
          Get Started For Free
        </Button>
      </Link>
    </div>
  </section>
  )
}