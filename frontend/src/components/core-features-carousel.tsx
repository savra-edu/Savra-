'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import FeatureTab from '@/components/feature-tab';
import FeatureCard from './feature-card';
interface Feature {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  webAppImage?: string;
  phoneImage?: string;
  cardGradient: string;
  tabColor: string;
}

interface CoreFeaturesCarouselProps {
  features: Feature[];
}

export default function CoreFeaturesCarousel({
  features,
}: CoreFeaturesCarouselProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  const handlePrevious = () => {
    setActiveFeature((prev) =>
      prev === 0 ? features.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveFeature((prev) =>
      prev === features.length - 1 ? 0 : prev + 1
    );
  };

  const currentFeature = features[activeFeature];

  return (
    <div className="w-full bg-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#333333] text-center flex-1">
          Core Features
        </h1>
      </div>

      {/* Feature Tabs */}
      <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12 flex-wrap px-4">
        {features.map((feature, index) => (
          <FeatureTab
            key={feature.id}
            label={feature.title}
            isActive={index === activeFeature}
            onClick={() => setActiveFeature(index)}
            activeTabColor={currentFeature.tabColor}
          />
        ))}
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center justify-center gap-2 md:gap-4 min-h-[300px] md:min-h-[400px] px-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md"
          aria-label="Previous feature"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </button>

        {/* Feature Card */}
        <div className="relative max-w-7xl mx-auto w-full overflow-visible">
          {/* Border SVG Background */}
          <Image 
            src="/border.svg" 
            alt="Border" 
            width={1286} 
            height={557} 
            sizes="100vw"
            className="absolute z-0 pointer-events-none hidden md:block"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scaleX(1.5)',
              width: 'calc(100% + 100px)',
              height: 'calc(100% + 40px)',
              objectFit: 'contain',
              maxWidth: '100vw'
            }}
          />
          <div className="relative z-10">
            <FeatureCard 
              feature={currentFeature} 
              cardGradient={currentFeature.cardGradient}
            />
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md"
          aria-label="Next feature"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
