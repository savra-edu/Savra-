import React from "react"
import Image from "next/image"
import MockupImage from '@/components/mockup-image';

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

interface FeatureCardProps {
  feature: Feature;
  cardGradient: string;
}

export default function FeatureCard({ feature, cardGradient }: FeatureCardProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden"
    style={{
      backgroundImage: "url('/Container.svg')"
    }}>
      <div 
        className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-6 lg:p-8 w-full h-auto md:h-[400px] rounded-3xl overflow-hidden"
        style={{
          background: cardGradient
        }}
      >
        {/* Left Content */}
        <div className="flex flex-col justify-start">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {feature.title}
          </h2>
          <p className="text-black mb-3 md:mb-4 text-sm md:text-base leading-relaxed">
            {feature.description}
          </p>
          <ul className="space-y-2 md:space-y-3">
            {feature.bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-2 md:gap-3 text-black text-sm md:text-base"
              >
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content - Mockup Image */}
        <div className="flex items-center justify-center md:justify-end">
          <MockupImage 
            webAppImage={feature.webAppImage}
            phoneImage={feature.phoneImage}
          />
        </div>
      </div>
    </div>
  );
}
