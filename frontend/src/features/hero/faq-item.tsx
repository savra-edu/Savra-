'use client';

import { Plus } from 'lucide-react';

interface FAQItemProps {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export default function FAQItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}: FAQItemProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 w-full z-560"
      style={{ background: 'linear-gradient(180deg, #93EAF8 0%, #83CBD7 100%)' }}
    >
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left font-medium text-gray-800 hover:text-gray-900 transition-colors"
      >
        <span className="text-base md:text-lg flex-1 pr-2 md:pr-4">{question}</span>
        <div
          className={`flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <Plus size={20} className="md:w-6 md:h-6 text-gray-800" strokeWidth={3} />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 md:px-6 pb-4 md:pb-5 text-gray-700 text-sm md:text-base leading-relaxed animate-in fade-in duration-300">
          {answer}
        </div>
      )}
    </div>
  );
}
