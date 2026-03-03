import FooterWithoutCloud from '@/features/footer-without-cloud';

interface FeaturePageLayoutProps {
  children: React.ReactNode;
}

export default function FeaturePageLayout({ children }: FeaturePageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Heading Section */}
      <div className="w-full mx-auto text-center bg-white px-4 md:px-6 lg:px-12 pt-8 md:pt-12 pb-6 md:pb-8">
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
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 md:px-6 lg:px-12 pb-8 md:pb-12">
        {children}
      </div>

      {/* Footer Section */}
      <div className="mt-auto">
        <FooterWithoutCloud />
      </div>
    </div>
  );
}
