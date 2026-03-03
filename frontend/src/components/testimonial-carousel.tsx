'use client';

import { useEffect, useRef } from 'react';
import TestimonialCard from './testimonial-card';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Set initial scroll position to start of first set
    container.scrollLeft = 0;

    // Smooth auto-scroll animation (right to left = increasing scrollLeft)
    const animate = () => {
      if (isPausedRef.current || !container) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Move very slowly: 0.3 pixels per frame (adjust for speed)
      container.scrollLeft += 0.3;

      // Reset to beginning when reaching the end of first set for seamless loop
      const maxScroll = container.scrollWidth / 2;
      if (container.scrollLeft >= maxScroll) {
        container.scrollLeft = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [testimonials.length]);

  return (
    <section className="relative w-full bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-hidden pb-4"
          style={{ 
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={`${testimonial.id}-${index}`} 
              testimonial={testimonial} 
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
