'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface FeatureCardProps {
  icon?: string;
  title: string;
  description: string;
  descriptionBottom: string;
  desktopImages: string[];
  mobileImages: string[];
  cardBgColor: string;
  buttonBgColor: string;
  onGetStarted?: () => void;
}

export function FeatureCard({
  icon,
  title,
  description,
  descriptionBottom,
  desktopImages,
  mobileImages,
  cardBgColor,
  buttonBgColor,
  onGetStarted,
}: FeatureCardProps) {
  const pathname = usePathname();
  const isLessonPlan = pathname?.includes('/lesson-plan');
  const isGamified = pathname?.includes('/gamified');
  
  return (
    <div className={`rounded-3xl ${cardBgColor} max-w-6xl mx-auto flex flex-col overflow-hidden`}>
      <div className="p-6 md:p-8 lg:p-12 flex-1">
      {/* Icon and Title */}
      <div className="mb-6 md:mb-8">
        {icon && (
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-4 md:mb-6">
            <Image
              src={icon || "/placeholder.svg"}
              alt="Feature icon"
              width={72}
              height={72}
              sizes="72px"
              className="w-12 h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]"
            />
          </div>
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A0B1E]">
          {title}
        </h2>
      </div>

      {/* First Row: First Paragraph + Desktop Images */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 md:gap-10 lg:gap-12 mb-12 md:mb-16">
        {/* First Paragraph */}
        <p className="text-base md:text-lg text-[#010D3E] leading-relaxed lg:w-[45%]">
          {description}
        </p>
        
        {/* Desktop Images - Stacked with top behind and offset */}
        <div className="relative lg:w-[45%] justify-center items-end h-[200px] md:h-[250px] lg:h-[280px]">
          {/* Background Desktop Image (behind, centered) */}
          {desktopImages[1] && (
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 rounded-2xl overflow-hidden"
              style={{ width: '95%', height: '90%' }}
            >
              <Image
                src={desktopImages[1] || "/placeholder.svg"}
                alt="Secondary desktop screenshot"
                width={600}
                height={400}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Foreground Desktop Image (front, slightly below background) */}
          {desktopImages[0] && (
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[10%] z-10 rounded-2xl overflow-hidden"
              style={{ width: '90%', height: '85%' }}
            >
              <Image
                src={desktopImages[0] || "/placeholder.svg"}
                alt="Main desktop screenshot"
                width={600}
                height={400}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Second Paragraph + Mobile Images */}
      <div className="flex flex-col mt-20 md:mt-40 lg:mt-56 lg:flex-row lg:items-start lg:justify-between gap-8 md:gap-10 lg:gap-12 mb-6 md:mb-8 relative">
        {/* Second Paragraph */}
        <p className="text-base md:text-lg text-[#010D3E] leading-relaxed lg:w-[45%]">
          {descriptionBottom}
        </p>
        
        {/* Mobile Images - Positioned on right, behind Get Started row */}
        {(mobileImages[0] || mobileImages[1]) && (
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 md:gap-6 lg:w-[45%] relative z-10" style={{ marginBottom: '-60px', marginTop: 'md:-120px' }}>
            {/* Left Mobile Image (Generated Plan) */}
            {mobileImages[1] && (
                <Image
                  src={mobileImages[1] || "/placeholder.svg"}
                  alt="Generated Plan mobile screenshot"
                  width={150}
                  height={150}
                  sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 150px"
                  className={`w-24 h-24 md:w-32 md:h-32 lg:w-full lg:h-full object-cover ${isLessonPlan ? 'border-2 border-black rounded-3xl' : ''}`}
                />
            )}
            
            {/* Right Mobile Image (Create Lesson Plan) */}
            {mobileImages[0] && (
                <Image
                  src={mobileImages[0] || "/placeholder.svg"}
                  alt="Create Lesson Plan mobile screenshot"
                  width={150}
                  height={250}
                  sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 250px"
                  className={`w-24 h-40 md:w-32 md:h-52 lg:w-full lg:h-full object-cover ${isLessonPlan || isGamified ? 'border-2 border-black rounded-3xl' : ''}`}
                />
            )}
          </div>
        )}
      </div>
      </div>

      {/* Get Started Button - Full Width Background at Bottom */}
      <div 
        onClick={onGetStarted}
        className={`w-full ${buttonBgColor} py-4 md:py-6 mt-auto cursor-pointer transition-opacity hover:opacity-90 relative z-30`}
      >
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-semibold text-gray-900 text-sm md:text-base">
            Get Started
            <ArrowRight size={18} className="md:w-5 md:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
