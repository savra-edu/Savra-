'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Testimonial } from '@/components/testimonial-carousel';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({
  testimonial,
}: TestimonialCardProps) {
  const [imageError, setImageError] = useState(false);
  const imagePath = `/${testimonial.avatar}.png`;

  return (
    <div className="w-[280px] md:w-[320px] lg:w-xs flex-shrink-0 bg-white border border-[#C4B0E8] rounded-3xl p-4 md:p-6">
      {/* User Info */}
      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs md:text-sm font-semibold text-gray-600 overflow-hidden">
          {!imageError ? (
            <Image
              src={imagePath}
              alt={testimonial.name}
              width={48}
              height={48}
              sizes="48px"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            testimonial.avatar
          )}
        </div>
        <div>
          <h3 className="font-semibold text-[#1F2937] text-xs md:text-sm">
            {testimonial.name}
          </h3>
          <p className="text-[#6B7280] text-[10px] md:text-xs">{testimonial.role}</p>
        </div>
      </div>

      {/* Testimonial Text */}
      <p className="text-[#4B5563] text-xs md:text-sm leading-relaxed">
        {testimonial.text}
      </p>
    </div>
  );
}
