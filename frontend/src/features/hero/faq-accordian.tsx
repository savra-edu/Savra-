'use client';

import { useState } from 'react';
import FAQItem from "@/features/hero/faq-item";

interface FAQData {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQData[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  }

  return (
    <section className="pt-16 md:pt-24 lg:pt-30 pb-20 md:pb-60 lg:pb-120 rounded-3xl px-4 md:px-8 lg:px-12" style={{ background: 'linear-gradient(180deg, #93EAF8 0%, #83CBD7 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-2">
          Frequently Asked
        </h2>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-8 md:mb-12">
          Questions
        </h3>

        <div className="space-y-3 md:space-y-4 z-570">
          {items.map((item) => (
            <FAQItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
