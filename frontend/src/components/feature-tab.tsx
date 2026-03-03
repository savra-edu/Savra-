'use client';

interface FeatureTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  activeTabColor: string;
}

export default function FeatureTab({
  label,
  isActive,
  onClick,
  activeTabColor,
}: FeatureTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 md:px-6 py-1.5 md:py-2 mt-2 md:mt-4 rounded-md text-xs md:text-sm font-semibold transition-all ${
        isActive
          ? 'text-gray-900 shadow-md'
          : 'border-2 border-gray-900 text-gray-900 bg-white hover:bg-gray-50'
      }`}
      style={isActive ? { backgroundColor: activeTabColor } : {}}
    >
      {label}
    </button>
  );
}
