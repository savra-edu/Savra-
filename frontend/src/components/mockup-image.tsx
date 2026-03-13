import Image from 'next/image';

interface MockupImageProps {
  webAppImage?: string;
  phoneImage?: string;
  webAppWidth?: number;
  webAppHeight?: number;
  phoneWidth?: number;
  phoneHeight?: number;
}

export default function MockupImage({
  webAppImage = '/web-app-mockup.png',
  phoneImage = '/phone-mockup.png',
  webAppWidth = 500,
  webAppHeight = 600,
  phoneWidth = 200,
  phoneHeight = 400,
}: MockupImageProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Web App Mockup - Larger, positioned centrally */}
      <div className="relative z-0">
        <Image
          src={webAppImage}
          alt="Web Application Mockup"
          width={webAppWidth}
          height={webAppHeight}
          sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
          className="rounded-lg shadow-lg object-contain w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto"
          style={{
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
          }}
        />
      </div>

      {/* Phone Mockup - Smaller, positioned to the right, overlapping, rotated - Hidden on mobile */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          right: '-8%',
          top: '95%',
          transform: 'translateY(-50%)',
        }}
      >
        <Image
          src={phoneImage}
          alt="Mobile Phone Mockup"
          width={phoneWidth}
          height={phoneHeight}
          sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 200px"
          className="rounded-md object-contain w-24 md:w-32 lg:w-[200px] h-auto"
          style={{
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
          }}
        />
      </div>
    </div>
  );
}
